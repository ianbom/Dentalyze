import time
from typing import cast

from app.core.config import settings
from app.core.trace import trace as _trace
from app.schemas.chat import ChatRequest
from app.services.external_knowledge import external_knowledge_service
from app.services.knowledge_retrieval import knowledge_retrieval_service


class LlmChatService:
    async def chat(self, payload: ChatRequest) -> dict[str, str]:
        started_at = time.perf_counter()
        _trace("LLM][START", role=payload.role, question=payload.question, context=self._trace_context_summary(payload.context))
        context = await self._context_with_rag(payload)
        provider = settings.llm_provider.strip().lower()
        model_name = self._active_model(provider)
        _trace("LLM][CONFIG", provider=provider, model_name=model_name, context=self._trace_context_summary(context))

        if provider not in {"gemini", "deepseek", "ollama"}:
            result = {
                "answer": (
                    "FastAPI aktif, tetapi AI_LLM_PROVIDER tidak dikenali. "
                    f"Nilai saat ini: {settings.llm_provider}. Gunakan gemini, deepseek, atau ollama."
                ),
                "provider": "fastapi-error",
            }
            result = self._append_external_sources(result, context)
            _trace("LLM][INVALID_PROVIDER", duration_ms=self._duration_ms(started_at), result=result)
            return result

        if not model_name:
            result = {
                "answer": (
                    f"Provider {provider} dipilih, tetapi model belum diisi. "
                    "Set AI_LLM_MODEL di .env."
                ),
                "provider": "fastapi-error",
            }
            result = self._append_external_sources(result, context)
            _trace("LLM][MISSING_MODEL", duration_ms=self._duration_ms(started_at), result=result)
            return result

        result = self._append_external_sources(await self._chat_with_langchain(payload, context, provider, model_name), context)
        _trace("LLM][END", duration_ms=self._duration_ms(started_at), result=result)

        return result

    async def _context_with_rag(self, payload: ChatRequest) -> dict[str, object]:
        started_at = time.perf_counter()
        context = dict(payload.context)
        knowledge = list(context.get("knowledge", []))
        _trace("RAG][CONTEXT_START", question=payload.question, context=self._trace_context_summary(context))

        try:
            retrieved = await knowledge_retrieval_service.retrieve(payload.question)
            knowledge.extend(
                {
                    "title": item["title"],
                    "condition_name": item["condition_name"],
                    "content": item["content"],
                    "relevance_score": item["relevance_score"],
                    "source": "ai_knowledge_bases",
                }
                for item in retrieved
            )
            _trace(
                "RAG][CONTEXT_RESULT",
                duration_ms=self._duration_ms(started_at),
                similarities=self._compact_knowledge(retrieved),
            )
        except Exception as exc:
            _trace(
                "RAG][CONTEXT_ERROR",
                duration_ms=self._duration_ms(started_at),
                exception_type=type(exc).__name__,
                exception=str(exc),
            )
            knowledge.append(
                {
                    "content": f"RAG ai_knowledge_bases gagal dijalankan: {exc}",
                    "source": "rag-error",
                }
            )

        try:
            external_sources = await external_knowledge_service.retrieve(payload.question, context)
        except Exception as exc:
            _trace(
                "EXTERNAL][CONTEXT_ERROR",
                duration_ms=self._duration_ms(started_at),
                exception_type=type(exc).__name__,
                exception=str(exc),
            )
            external_sources = []

        knowledge.extend(external_sources)
        context["knowledge"] = knowledge
        context["external_sources"] = external_sources
        _trace(
            "RAG][CONTEXT_COMPLETE",
            duration_ms=self._duration_ms(started_at),
            external_sources=self._compact_external_sources(external_sources),
            context=self._trace_context_summary(context),
        )

        return context

    def _context_to_text(self, context: dict[str, object]) -> str:
        lines: list[str] = []
        viewer = cast(dict[str, object], context.get("viewer", {}))
        intent = str(context.get("intent", "knowledge"))
        lookup_status = str(context.get("lookup_status", "not_requested"))
        lines.append(f"Role pengguna: {viewer.get('role', '-')}")
        lines.append(f"Nama pengguna: {viewer.get('name', '-')}")
        lines.append(f"Aturan akses: {context.get('scope_rule', '-')}")
        lines.append(f"Intent pertanyaan: {intent}")
        lines.append(f"Status pencarian data: {lookup_status}")

        if intent == "knowledge":
            lines.append("Data klinis personal tidak diperlukan; jawab dari knowledge yang tersedia.")
        elif lookup_status in {"not_found", "denied", "ambiguous"}:
            lines.append("Data klinis target tidak tersedia. Jangan mengarang kondisi, diagnosis, atau identitas pasien.")

        for radiograph in cast(list[dict[str, object]], context.get("radiographs", [])):
            lines.append(
                "Radiograf {id} pasien {patient} status {status}, dokter {doctor}, radiografer {radiographer}.".format(
                    id=radiograph.get("id", "-"),
                    patient=radiograph.get("patient_name") or radiograph.get("patient_nik", "-"),
                    status=radiograph.get("status", "-"),
                    doctor=radiograph.get("doctor") or "-",
                    radiographer=radiograph.get("radiographer") or "-",
                )
            )
            for detection in cast(list[dict[str, object]], radiograph.get("detections", [])):
                lines.append(
                    "- Gigi {fdi}: {abnormality}. Catatan: {analysis}".format(
                        fdi=detection.get("fdi", "-"),
                        abnormality=detection.get("abnormality", "-"),
                        analysis=detection.get("analysis") or "-",
                    )
                )

        for snippet in cast(list[dict[str, object]], context.get("knowledge", [])):
            label = snippet.get("title") or snippet.get("source") or "Knowledge"
            score = snippet.get("relevance_score")
            suffix = f" (relevance {score:.4f})" if isinstance(score, float) else ""
            lines.append(f"{label}{suffix}: {snippet.get('content', '')}")

        text = "\n".join(lines)
        if len(text) <= settings.llm_context_max_chars:
            return text

        return text[: settings.llm_context_max_chars] + "\n\n[Konteks dipangkas agar tidak melebihi kuota token.]"

    def _fallback_answer(self, payload: ChatRequest, context: dict[str, object]) -> str:
        radiographs = cast(list[dict[str, object]], context.get("radiographs", []))
        total = sum(len(cast(list[dict[str, object]], item.get("detections", []))) for item in radiographs)
        knowledge_count = len(cast(list[dict[str, object]], context.get("knowledge", [])))
        provider = settings.llm_provider.strip().lower() or "llm"

        return (
            f"Provider {provider} belum aktif di FastAPI. Saya sudah menerima konteks role "
            f"{payload.role} dengan {len(radiographs)} radiograf dan {total} "
            f"baris deteksi serta {knowledge_count} knowledge hasil RAG. "
            "Periksa konfigurasi provider, model, dan API key di .env agar jawaban LLM aktif."
        )

    async def _chat_with_langchain(
        self,
        payload: ChatRequest,
        context: dict[str, object],
        provider: str,
        model_name: str,
    ) -> dict[str, str]:
        from langchain_core.messages import HumanMessage, SystemMessage

        _trace("LLM][INITIALIZE", provider=provider, model_name=model_name)
        if provider == "gemini":
            if not settings.gemini_api_key:
                result = {"answer": self._fallback_answer(payload, context), "provider": "fastapi-fallback"}
                _trace("LLM][FALLBACK", reason="missing Gemini API key", result=result)
                return result

            try:
                from langchain_google_genai import ChatGoogleGenerativeAI

                llm = ChatGoogleGenerativeAI(
                    model=model_name,
                    google_api_key=settings.gemini_api_key,
                    temperature=0.2,
                )
            except Exception as exc:
                _trace("LLM][INITIALIZE_ERROR", provider=provider, exception_type=type(exc).__name__, exception=str(exc))
                return {
                    "answer": "Layanan AI sementara tidak dapat diinisialisasi. Periksa konfigurasi provider lalu coba lagi.",
                    "provider": "fastapi-error",
                }
        elif provider == "deepseek":
            if not settings.deepseek_api_key:
                result = {"answer": self._fallback_answer(payload, context), "provider": "fastapi-fallback"}
                _trace("LLM][FALLBACK", reason="missing DeepSeek API key", result=result)
                return result

            try:
                from langchain_openai import ChatOpenAI

                llm = ChatOpenAI(
                    model=model_name,
                    api_key=settings.deepseek_api_key,
                    base_url=settings.deepseek_base_url.rstrip("/") + "/",
                    temperature=0.2,
                )
            except Exception as exc:
                _trace("LLM][INITIALIZE_ERROR", provider=provider, exception_type=type(exc).__name__, exception=str(exc))
                return {
                    "answer": "Layanan AI sementara tidak dapat diinisialisasi. Periksa konfigurasi provider lalu coba lagi.",
                    "provider": "fastapi-error",
                }
        else:
            try:
                from langchain_ollama import ChatOllama

                llm = ChatOllama(
                    model=model_name,
                    base_url=settings.ollama_base_url,
                    temperature=0.2,
                )
            except Exception as exc:
                _trace("LLM][INITIALIZE_ERROR", provider=provider, exception_type=type(exc).__name__, exception=str(exc))
                return {
                    "answer": "Layanan AI sementara tidak dapat terhubung. Pastikan Ollama aktif dan model tersedia, lalu coba lagi.",
                    "provider": "fastapi-error",
                }

        system_prompt = self._system_prompt()
        human_prompt = (
            f"Pertanyaan pengguna:\n{payload.question}\n\n"
            f"Konteks database dan knowledge RAG:\n{self._context_to_text(context)}"
        )
        started_at = time.perf_counter()
        _trace(
            "LLM][PROMPT",
            provider=provider,
            model_name=model_name,
            system_prompt_chars=len(system_prompt),
            human_prompt_chars=len(human_prompt),
            context=self._trace_context_summary(context),
        )

        try:
            response = await llm.ainvoke(
                [
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=human_prompt),
                ]
            )
            result = {"answer": str(response.content), "provider": f"{provider}:{model_name}"}
            _trace("LLM][RESPONSE", duration_ms=self._duration_ms(started_at), result=result)
            return result
        except Exception as exc:
            _trace(
                "LLM][INVOKE_ERROR",
                duration_ms=self._duration_ms(started_at),
                exception_type=type(exc).__name__,
                exception=str(exc),
            )
            return {
                "answer": "Layanan AI sementara tidak dapat terhubung. Pastikan Ollama aktif dan model tersedia, lalu coba lagi.",
                "provider": "fastapi-error",
            }

    def _active_model(self, provider: str) -> str:
        if settings.llm_model:
            return settings.llm_model.strip()

        if provider == "gemini":
            return settings.gemini_model.strip()

        if provider == "ollama":
            return settings.ollama_chat_model.strip()

        return ""

    @staticmethod
    def _compact_knowledge(knowledge: list[dict[str, object]]) -> list[dict[str, object]]:
        return [
            {
                "rank": index,
                "id": item.get("id"),
                "title": item.get("title"),
                "source": item.get("source", "ai_knowledge_bases"),
                "cosine_similarity": round(float(item.get("relevance_score") or 0.0), 4),
            }
            for index, item in enumerate(knowledge, start=1)
            if item.get("source", "ai_knowledge_bases") != "alodokter"
        ]

    @staticmethod
    def _compact_external_sources(sources: list[dict[str, object]]) -> list[dict[str, object]]:
        return [{"title": source.get("title"), "url": source.get("url")} for source in sources]

    @classmethod
    def _trace_context_summary(cls, context: dict[str, object]) -> dict[str, object]:
        radiographs = cast(list[dict[str, object]], context.get("radiographs", []))
        return {
            "intent": context.get("intent"),
            "lookup_status": context.get("lookup_status"),
            "knowledge_count": len(cast(list[dict[str, object]], context.get("knowledge", []))),
            "knowledge": cls._compact_knowledge(cast(list[dict[str, object]], context.get("knowledge", []))),
            "external_sources": cls._compact_external_sources(cast(list[dict[str, object]], context.get("external_sources", []))),
            "radiograph_count": len(radiographs),
            "detection_count": sum(len(cast(list[dict[str, object]], item.get("detections", []))) for item in radiographs),
        }

    @staticmethod
    def _append_external_sources(result: dict[str, str], context: dict[str, object]) -> dict[str, str]:
        sources = cast(list[dict[str, object]], context.get("external_sources", []))
        unique: list[tuple[str, str]] = []
        seen: set[str] = set()
        for source in sources:
            url = str(source.get("url") or "")
            if not url or url in seen:
                continue
            seen.add(url)
            unique.append((str(source.get("title") or "Alodokter"), url))

        if not unique:
            return result

        footer = "\n".join(f"- {title}: {url}" for title, url in unique)
        return {**result, "answer": result["answer"].rstrip() + "\n\nSumber eksternal:\n" + footer}

    def _system_prompt(self) -> str:
        return (
            "Anda adalah asisten Dentalyze AI untuk analisis radiografi gigi. "
            "Jawab dalam bahasa Indonesia yang ringkas, empatik, dan klinis. "
            "Gunakan hanya konteks yang diberikan. Jangan mengarang diagnosis, kondisi pasien, atau identitas pasien. "
            "Jika lookup_status adalah not_found, denied, atau ambiguous, jelaskan status tersebut dan minta klarifikasi bila perlu. "
            "Jika intent adalah knowledge, jangan menyimpulkan kondisi klinis pengguna. "
            "Jika data tidak cukup, katakan bahwa pemeriksaan dokter tetap dibutuhkan. Hormati aturan akses role."
        )

    @staticmethod
    def _duration_ms(started_at: float) -> float:
        return round((time.perf_counter() - started_at) * 1000, 2)


llm_chat_service = LlmChatService()
