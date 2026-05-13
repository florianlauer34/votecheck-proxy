# main.py — Alternative Python (FastAPI) si vous préférez
# Déploiement gratuit sur Render.com ou Railway.app

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import re

app = FastAPI(title="VoteCheck Proxy", description="Proxy vers NosDéputés.fr")

# CORS — autoriser tous les origines
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

ALLOWED_ENDPOINTS = {"json", "votes/json", "amendements/json"}
ND_BASE = "https://www.nosdeputes.fr"

@app.get("/api/depute")
async def get_depute(
    slug: str = Query(..., description="Ex: marine-le-pen"),
    endpoint: str = Query("json", description="Ex: json, votes/json")
):
    # Validation
    if not re.match(r'^[a-z0-9-]+$', slug):
        raise HTTPException(400, "Slug invalide")
    if endpoint not in ALLOWED_ENDPOINTS:
        raise HTTPException(400, f"Endpoint non autorisé. Utilisez: {', '.join(ALLOWED_ENDPOINTS)}")

    url = f"{ND_BASE}/{slug}/{endpoint}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(url, headers={"User-Agent": "VoteCheck/1.0"})
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(e.response.status_code, f"NosDéputés.fr a renvoyé {e.response.status_code}")
        except Exception as e:
            raise HTTPException(500, str(e))

@app.get("/health")
async def health():
    return {"status": "ok"}