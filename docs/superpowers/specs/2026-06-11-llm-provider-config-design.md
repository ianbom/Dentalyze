# LLM Provider Config Design

Date: 2026-06-11
Scope: `dentograph-yolo` LLM generation provider/model configuration, keeping Laravel request contract stable.

## Goal

Make LLM generation configurable from environment variables so developers can choose `gemini`, `deepseek`, or `ollama` without changing source code. The selected provider and model must come from `.env`.

## Current State

- `dentograph-web` sends chat requests to FastAPI `/chat` and expects `{ answer, provider }`.
- `dentograph-yolo` currently hardcodes Gemini as the default remote provider and has a special-case Ollama path.
- Config is provider-specific today: `GEMINI_API_KEY`, `GEMINI_MODEL`, `AI_LLM_PROVIDER`, `OLLAMA_*`.
- Fallback copy still assumes Gemini is the only hosted provider.

## Desired Behavior

- Developers can set:
  - `AI_LLM_PROVIDER=gemini|deepseek|ollama`
  - `AI_LLM_MODEL=<provider-specific model name>`
- Existing Ollama support remains available.
- Gemini support remains available.
- DeepSeek is added as a new provider.
- Laravel does not need to know which provider is active; FastAPI remains the provider gateway.
- Response payload shape remains `{ answer, provider }`.
- All three providers must be executed through LangChain.
- The chat service should use one unified provider execution path rather than separate `_chat_with_*` functions.

## Non-Goals

- No per-request provider switching from Laravel.
- No UI for changing provider.
- No embedding-provider changes.
- No generalized provider marketplace abstraction beyond the three required providers.

## Env Contract

### Required generic vars

- `AI_LLM_PROVIDER`
- `AI_LLM_MODEL`

### Provider-specific vars

- Gemini:
  - `GEMINI_API_KEY`
- DeepSeek:
  - `DEEPSEEK_API_KEY`
  - `DEEPSEEK_BASE_URL`
- Ollama:
  - `OLLAMA_BASE_URL`

### Compatibility rules

- `AI_LLM_MODEL` becomes the canonical model variable for all providers.
- `OLLAMA_CHAT_MODEL` may remain as a backward-compatible fallback for Ollama if `AI_LLM_MODEL` is empty, but new `.env.example` should document `AI_LLM_MODEL` as the primary variable.
- `GEMINI_MODEL` should no longer be the primary runtime source. It may be kept only as a temporary backward-compatible fallback if needed during migration.

## Architecture

### Config layer

Update `dentograph-yolo/app/core/config.py` to expose:

- `llm_provider`
- `llm_model`
- `gemini_api_key`
- `deepseek_api_key`
- `deepseek_base_url`
- existing Ollama settings

This keeps provider selection centralized in config and prevents model names from being hardcoded in service logic.

### LLM service layer

Refactor `dentograph-yolo/app/services/llm_chat.py` into one unified LangChain execution path:

- `chat()` builds context once.
- It validates provider and model once.
- It calls a single function such as `_chat_with_langchain(payload, context, provider, model_name)`.
- That function classifies the provider and creates the matching LangChain chat model instance.
- Prompt assembly and `ainvoke(...)` stay shared.

### Provider behavior

#### Gemini

- Keep LangChain Gemini via `ChatGoogleGenerativeAI`.
- Use `AI_LLM_MODEL` instead of provider-specific model hardcoding.

#### DeepSeek

- Use LangChain for DeepSeek as well.
- Implement via `ChatOpenAI` from `langchain-openai`, configured with `DEEPSEEK_BASE_URL` and `DEEPSEEK_API_KEY`.
- Use `AI_LLM_MODEL` from env exactly as configured by the developer.
- Do not hardcode a DeepSeek model in source.

#### Ollama

- Keep LangChain Ollama via `ChatOllama`.
- Use `AI_LLM_MODEL` as primary model source.
- Preserve `OLLAMA_BASE_URL` behavior.

## Error Handling

- If a provider is selected but its required credential/base URL is missing, return a provider-specific error response in the same `{ answer, provider }` shape.
- If `AI_LLM_PROVIDER` is unsupported, return a clear config error in the same shape.
- Generic fallback copy must stop telling users only to set `GEMINI_API_KEY`; it should mention the active provider or generic LLM configuration.
- Existing FastAPI outer response contract remains unchanged.

## Laravel Impact

- `dentograph-web` should not need request-shape changes.
- Optional cleanup: fallback/provider copy in `AiLlmService.php` may be made provider-neutral to avoid stale Gemini-only messaging.

## Tests

Update or add tests for:

- env config parsing for:
  - `AI_LLM_PROVIDER`
  - `AI_LLM_MODEL`
  - `DEEPSEEK_API_KEY`
  - `DEEPSEEK_BASE_URL`
- unified LangChain dispatch behavior:
  - provider `gemini`
  - provider `deepseek`
  - provider `ollama`
  - unsupported provider error
  - missing model error
- backward-compatible env loading if fallback vars are retained
- existing FastAPI contract remains stable

Tests should mock provider calls rather than require live network access.

## Implementation Notes

- Keep the change focused inside `dentograph-yolo` plus minimal wording cleanup in Laravel.
- Add `langchain-openai` to dependencies so DeepSeek can stay on LangChain too.
- Do not change embedding or prediction endpoints.

## Rollout

1. Update config and `.env.example`.
2. Refactor to one unified LangChain execution path.
3. Add LangChain DeepSeek implementation.
4. Update tests.
5. Run targeted Python and Laravel tests.

## Acceptance Criteria

- Changing `.env` can switch between `gemini`, `deepseek`, and `ollama` without source edits.
- Changing `.env` can switch the active model name without source edits.
- Chat endpoint still returns `{ answer, provider }`.
- Unsupported or misconfigured providers return explicit config errors.
- Existing Ollama path still works.
- All provider execution uses LangChain.
