import asyncio
import re
import time
from html.parser import HTMLParser
from typing import Any
from urllib.parse import quote_plus, urljoin, urlparse
from urllib.request import Request, urlopen

from app.core.config import settings
from app.core.trace import trace

_ALLOWED_HOSTS = {"alodokter.com", "www.alodokter.com"}


class _LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[tuple[str, str]] = []
        self._href: str | None = None
        self._text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if tag == "card-post-index":
            href = attributes.get("url-path")
            if href:
                self.links.append((href, attributes.get("title") or ""))
            return
        if tag != "a":
            return
        self._href = attributes.get("href")
        self._text = []

    def handle_data(self, data: str) -> None:
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self._href:
            self.links.append((self._href, " ".join(self._text).strip()))
            self._href = None
            self._text = []


class _ArticleParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title: list[str] = []
        self.text: list[str] = []
        self._in_title = False
        self._ignored_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "title":
            self._in_title = True
        if tag in {"script", "style", "noscript", "svg"}:
            self._ignored_depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False
        if tag in {"script", "style", "noscript", "svg"} and self._ignored_depth:
            self._ignored_depth -= 1

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title.append(data)
        elif not self._ignored_depth:
            self.text.append(data)


class ExternalKnowledgeService:
    def __init__(self) -> None:
        self._cache: dict[str, tuple[float, list[dict[str, str]]]] = {}

    def build_query(self, question: str, context: dict[str, object]) -> str:
        query = question
        viewer = context.get("viewer")
        if isinstance(viewer, dict):
            query = self._remove_value(query, viewer.get("name"))

        for patient in context.get("patients", []):
            if isinstance(patient, dict):
                query = self._remove_value(query, patient.get("name"))
                query = self._remove_value(query, patient.get("nik"))

        for radiograph in context.get("radiographs", []):
            if isinstance(radiograph, dict):
                query = self._remove_value(query, radiograph.get("id"))

        query = re.sub(r"\bRAD-[A-Z0-9-]+\b", " ", query, flags=re.IGNORECASE)
        query = re.sub(r"\b\d{10,16}\b", " ", query)
        query = re.sub(r"\b(?:pasien|patient)\s+[\wÀ-ÿ'’-]+(?:\s+[\wÀ-ÿ'’-]+){0,5}", " ", query, flags=re.IGNORECASE)
        query = re.sub(r"\b(?:email|telepon|nomor|nik)\b", " ", query, flags=re.IGNORECASE)
        query = re.sub(r"\b(?:saya|aku|milikku|milik saya)\b", " ", query, flags=re.IGNORECASE)
        query = re.sub(r"\s+", " ", query).strip(" ?!.:,;")

        if context.get("intent") in {"self_clinical", "radiograph", "patient_name"}:
            query = f"kesehatan gigi radiograf {query}".strip()

        return query or "kesehatan gigi"

    async def retrieve(self, question: str, context: dict[str, object]) -> list[dict[str, str]]:
        if not getattr(settings, "external_knowledge_enabled", True):
            trace("EXTERNAL][SKIPPED", reason="disabled")
            return []

        query = self.build_query(question, context)
        now = time.monotonic()
        cached = self._cache.get(query)
        cache_ttl = float(getattr(settings, "external_cache_ttl", 300))
        if cached and cached[0] > now:
            trace("EXTERNAL][CACHE_HIT", query=query, results=self._compact_results(cached[1]))
            return cached[1]

        started_at = time.perf_counter()
        trace("EXTERNAL][START", query=query, intent=context.get("intent"))
        try:
            search_url = getattr(settings, "alodokter_search_url", "https://www.alodokter.com/search?s={query}").format(query=quote_plus(query))
            search_html = await asyncio.to_thread(self._fetch_text, search_url)
            article_urls = self._extract_article_urls(search_html)
            top_k = int(getattr(settings, "alodokter_top_k", 3))
            results: list[dict[str, str]] = []
            for url, anchor_title in article_urls[:top_k]:
                article_html = await asyncio.to_thread(self._fetch_text, url)
                article = self._parse_article(article_html, url, anchor_title)
                if article["content"]:
                    results.append(article)

            self._cache[query] = (now + cache_ttl, results)
            trace("EXTERNAL][RESULT", duration_ms=round((time.perf_counter() - started_at) * 1000, 2), query=query, results=self._compact_results(results))
            return results
        except Exception as exc:
            trace(
                "EXTERNAL][ERROR",
                duration_ms=round((time.perf_counter() - started_at) * 1000, 2),
                query=query,
                exception_type=type(exc).__name__,
                exception=str(exc),
            )
            return []

    @staticmethod
    def _remove_value(text: str, value: object) -> str:
        if not isinstance(value, str) or not value.strip():
            return text

        return re.sub(re.escape(value.strip()), " ", text, flags=re.IGNORECASE)

    def _fetch_text(self, url: str) -> str:
        if not self._is_allowed_url(url):
            raise ValueError(f"URL eksternal ditolak: {url}")

        request = Request(url, headers={"User-Agent": "DentalyzeAI/1.0 (+local clinical assistant)"})
        with urlopen(request, timeout=float(getattr(settings, "alodokter_timeout", 5))) as response:
            final_url = response.geturl()
            if not self._is_allowed_url(final_url):
                raise ValueError(f"Redirect eksternal ditolak: {final_url}")
            return response.read().decode(response.headers.get_content_charset() or "utf-8", errors="replace")

    @staticmethod
    def _compact_results(results: list[dict[str, str]]) -> list[dict[str, str]]:
        return [{"title": item.get("title", ""), "url": item.get("url", "")} for item in results]

    def _extract_article_urls(self, html: str) -> list[tuple[str, str]]:
        parser = _LinkParser()
        parser.feed(html)
        links: list[tuple[str, str]] = []
        seen: set[str] = set()
        for href, title in parser.links:
            url = urljoin("https://www.alodokter.com/", href).split("#", 1)[0]
            path = urlparse(url).path.rstrip("/")
            if not self._is_allowed_url(url) or not path or path == "/search" or url in seen:
                continue
            seen.add(url)
            links.append((url, title))

        return links

    def _parse_article(self, html: str, url: str, anchor_title: str) -> dict[str, str]:
        parser = _ArticleParser()
        parser.feed(html)
        title = re.sub(r"\s+-\s+Alodokter\s*$", "", " ".join(" ".join(parser.title).split()), flags=re.IGNORECASE) or anchor_title or urlparse(url).path.rsplit("/", 1)[-1].replace("-", " ").title()
        content = " ".join(" ".join(parser.text).split())

        return {
            "source": "alodokter",
            "title": title,
            "url": url,
            "content": content[:6000],
        }

    @staticmethod
    def _is_allowed_url(url: str) -> bool:
        parsed = urlparse(url)
        return parsed.scheme == "https" and parsed.hostname in _ALLOWED_HOSTS


external_knowledge_service = ExternalKnowledgeService()
