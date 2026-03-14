# FastAPI server — two routes only, no business logic
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pydantic import BaseModel

from models import CVData, AISettings
from agent import run_agent
from memory import clear_memory
from settings_store import get_settings, save_settings as store_save_settings, delete_settings

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AgentRequest(BaseModel):
    sessionId: str
    instruction: str
    cv: CVData
    planMode: bool = True
    settings: Optional[AISettings] = None


@app.post("/agent")
async def agent_route(body: AgentRequest):
    try:
        result = await run_agent(
            body.sessionId, body.instruction, body.cv, body.planMode, body.settings
        )
        return result
    except Exception as e:
        print(f"[route] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/session/{session_id}")
def delete_session(session_id: str):
    clear_memory(session_id)
    delete_settings(session_id)
    return {"ok": True}


@app.get("/settings/{session_id}")
def get_user_settings(session_id: str):
    """Get AI settings for a session."""
    settings = get_settings(session_id)
    if settings:
        return settings.model_dump()
    # Return default settings if none exist
    return {
        "provider": "openai",
        "model": "gpt-4o-mini",
        "apiKey": "",
        "baseUrl": None
    }


@app.post("/settings/{session_id}")
def save_user_settings(session_id: str, settings: AISettings):
    """Save AI settings for a session."""
    try:
        store_save_settings(session_id, settings)
        return {"ok": True, "settings": settings.model_dump()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save settings: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=3001, reload=True)
