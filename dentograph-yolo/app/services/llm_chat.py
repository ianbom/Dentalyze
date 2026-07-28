from typing import cast

from app.core.config import settings
from app.schemas.chat import ChatRequest
from app.services.knowledge_retrieval import knowledge_retrieval_service


class LlmChatService:
    async def chat(self, payload: ChatRequest) -> dict[str, str]:
        context = await self._context_with_rag(payload)
        provider = settings.llm_provider.strip().lower()
        model_name = self._active_model(provider)

        if provider not in {"gemini", "deepseek", "ollama"}:
            return {
                "answer": (
                    "FastAPI aktif, tetapi AI_LLM_PROVIDER tidak dikenali. "
                    f"Nilai saat ini: {settings.llm_provider}. Gunakan gemini, deepseek, atau ollama."
                ),
                "provider": "fastapi-error",
            }

        if not model_name:
            return {
                "answer": (
                    f"Provider {provider} dipilih, tetapi model belum diisi. "
                    "Set AI_LLM_MODEL di .env."
                ),
                "provider": "fastapi-error",
            }

        return await self._chat_with_langchain(payload, context, provider, model_name)

    async def _context_with_rag(self, payload: ChatRequest) -> dict[str, object]:
        context = dict(payload.context)
        knowledge = list(context.get("knowledge", []))

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
        except Exception as exc:
            knowledge.append(
                {
                    "content": f"RAG ai_knowledge_bases gagal dijalankan: {exc}",
                    "source": "rag-error",
                }
            )

        context["knowledge"] = knowledge

        return context

    def _context_to_text(self, context: dict[str, object]) -> str:
        lines: list[str] = []
        viewer = cast(dict[str, object], context.get("viewer", {}))
        lines.append(f"Role pengguna: {viewer.get('role', '-')}")
        lines.append(f"Nama pengguna: {viewer.get('name', '-')}")
        lines.append(f"Aturan akses: {context.get('scope_rule', '-')}")

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

        if provider == "gemini":
            if not settings.gemini_api_key:
                return {"answer": self._fallback_answer(payload, context), "provider": "fastapi-fallback"}

            try:
                from langchain_google_genai import ChatGoogleGenerativeAI

                llm = ChatGoogleGenerativeAI(
                    model=model_name,
                    google_api_key=settings.gemini_api_key,
                    temperature=0.2,
                )
            except Exception as exc:
                return {
                    "answer": "Layanan AI sementara tidak dapat diinisialisasi. Periksa konfigurasi provider lalu coba lagi.",
                    "provider": "fastapi-error",
                }
        elif provider == "deepseek":
            if not settings.deepseek_api_key:
                return {"answer": self._fallback_answer(payload, context), "provider": "fastapi-fallback"}

            try:
                from langchain_openai import ChatOpenAI

                llm = ChatOpenAI(
                    model=model_name,
                    api_key=settings.deepseek_api_key,
                    base_url=settings.deepseek_base_url.rstrip("/") + "/",
                    temperature=0.2,
                )
            except Exception as exc:
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
                return {
                    "answer": "Layanan AI sementara tidak dapat terhubung. Pastikan Ollama aktif dan model tersedia, lalu coba lagi.",
                    "provider": "fastapi-error",
                }

        try:
            response = await llm.ainvoke(
                [
                    SystemMessage(content=self._system_prompt()),
                    HumanMessage(
                        content=(
                            f"Pertanyaan pengguna:\n{payload.question}\n\n"
                            f"Konteks database dan knowledge RAG:\n{self._context_to_text(context)}"
                        )
                    ),
                ]
            )
            return {"answer": str(response.content), "provider": f"{provider}:{model_name}"}
        except Exception as exc:
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

    def _system_prompt(self) -> str:
        return (
            "Anda adalah asisten Dentalyze AI untuk analisis radiografi gigi. "
            "Jawab dalam bahasa Indonesia yang ringkas, empatik, dan klinis. "
            "Gunakan hanya konteks yang diberikan. Jangan mengarang diagnosis. "
            "Jika data tidak cukup, katakan bahwa pemeriksaan dokter tetap dibutuhkan. "
            "Hormati aturan akses role."
        )


llm_chat_service = LlmChatService()
