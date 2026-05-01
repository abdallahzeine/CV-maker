from langchain_openai import ChatOpenAI

LM_STUDIO_BASE_URL = "http://127.0.0.1:1234/v1"
LM_STUDIO_MODEL = "qwen3.5-4b"


def get_llm(model: str | None = None, temperature: float | None = None, thinking_mode: bool = True):
    return ChatOpenAI(
        model=model or LM_STUDIO_MODEL,
        temperature=temperature if temperature is not None else 0.7,
        api_key="not-needed",
        base_url=LM_STUDIO_BASE_URL,
        extra_body={"enable_thinking": thinking_mode},
    )