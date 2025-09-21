# app.py - Medical Bot Web Application using Agno 2.x AgentOS
import os
import hashlib
import secrets
import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse, Response
from pydantic import BaseModel
from agno.os import AgentOS
from agno.os.config import AgentOSConfig, ChatConfig

# Import the medical agent
from medical_agent_with_team import create_hausarzt_agent

# --- Logging Setup ---
logger = logging.getLogger(__name__)

# --- Auth Configuration ---
EXPECTED_TOKEN = None
COOKIE_SECRET = None

def get_cookie_secret():
    global COOKIE_SECRET
    if COOKIE_SECRET is None:
        COOKIE_SECRET = os.getenv("COOKIE_SECRET", secrets.token_hex(32))
    return COOKIE_SECRET

def create_secure_token(password: str) -> str:
    secret = get_cookie_secret()
    return hashlib.sha256(f"{password}:{secret}".encode()).hexdigest()

def get_expected_token():
    global EXPECTED_TOKEN
    if EXPECTED_TOKEN is None:
        password = os.getenv("AUTH_PASSWORD")
        if password:
            EXPECTED_TOKEN = create_secure_token(password)
    return EXPECTED_TOKEN

def create_medical_app():
    """Create and configure the medical consultation AgentOS application."""

    # Create the Hausarzt agent
    hausarzt = create_hausarzt_agent()

    # Configure AgentOS
    agent_os_config = AgentOSConfig(
        chat=ChatConfig(
            quick_prompts={
                "Dr. Hausarzt": [
                    "Hallo Doktor, ich habe Kopfschmerzen seit 2 Tagen.",
                    "Mir ist seit gestern Abend übel und ich habe Fieber.",
                ]
            }
        )
    )

    # Create AgentOS instance
    agent_os = AgentOS(
        os_id="medical-consultation-os",
        description="Europäische Hausarztpraxis mit Spezialistenteam - Medizinische Beratung und Symptomanalyse",
        agents=[hausarzt],
        config=agent_os_config
    )

    return agent_os

def main():
    """Main entry point for the medical consultation web application."""
    print("🏥 Starte Medizinische Beratungs-Anwendung...")
    print("=" * 60)
    print("📋 System: Europäische Hausarztpraxis mit 5-köpfigem Spezialistenteam")
    print("👨‍⚕️ Agent: Dr. Hausarzt (Patientenschnittstelle)")
    print("🔧 Tools: Medizinisches Team-Konsultationstool aktiviert")
    print("=" * 60)

    # Create the application
    agent_os = create_medical_app()

    print("🌐 Verfügbare Endpunkte:")
    print("- Web Interface: http://localhost:8080")
    print("- API Dokumentation: http://localhost:8080/docs")
    print("- Agent Interface: http://localhost:8080/agents")
    print("=" * 60)

    # Start the server
    agent_os.serve(
        app="app:app",
        host="0.0.0.0",
        port=8080,
        reload=True
    )

# Create the AgentOS and get FastAPI app
agent_os = create_medical_app()
app = agent_os.get_app()

# --- Auth Middleware ---
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    # Check if authentication is enabled
    auth_password = os.getenv("AUTH_PASSWORD")

    # If no AUTH_PASSWORD is set, skip authentication
    if not auth_password:
        response = await call_next(request)
        return response

    # Define public paths that don't require authentication
    public_paths = ["/login", "/api/login", "/favicon.ico", "/docs", "/openapi.json"]
    public_static_extensions = [".css", ".js", ".png", ".ico", ".svg"]

    # Check if current path is public
    path = request.url.path
    if (path in public_paths or
        any(path.endswith(ext) for ext in public_static_extensions) or
        path.startswith("/static/")):
        response = await call_next(request)
        return response

    # Check web authentication (cookies)
    auth_token = request.cookies.get("auth_token")
    expected_token = get_expected_token()
    web_auth_valid = auth_token and expected_token and auth_token == expected_token

    if not web_auth_valid:
        # Redirect to login page with return URL
        return RedirectResponse(
            url=f"/login?redirect={request.url.path}",
            status_code=302
        )

    # Authentication successful, proceed with request
    response = await call_next(request)
    return response

# Add static file serving and frontend routes
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

# Mount static files first
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# --- Login Routes ---
class LoginRequest(BaseModel):
    password: str
    redirect: str = "/"

@app.get("/login")
async def login_page():
    """Serve the login HTML page."""
    return FileResponse(os.path.join(STATIC_DIR, "login.html"))

@app.post("/api/login")
async def login(request: LoginRequest):
    """Authenticate user and set secure cookie."""
    auth_password = os.getenv("AUTH_PASSWORD")

    if not auth_password:
        raise HTTPException(status_code=503, detail="Authentication not configured")

    if request.password != auth_password:
        raise HTTPException(status_code=401, detail="Invalid password")

    # Create secure token and set cookie
    secure_token = create_secure_token(auth_password)

    response = RedirectResponse(
        url=request.redirect if request.redirect else "/",
        status_code=302
    )

    # Set secure cookie (12 months = 31536000 seconds)
    response.set_cookie(
        key="auth_token",
        value=secure_token,
        max_age=31536000,  # 12 months
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax"
    )

    return response

# Favicon route to prevent 404 errors
@app.get("/favicon.ico")
async def favicon():
    """Return empty response for favicon to prevent 404 errors."""
    return Response(status_code=204)  # No Content

# Remove existing root route and add our own
from fastapi.routing import APIRoute
existing_routes = [route for route in app.routes if isinstance(route, APIRoute) and route.path == "/"]
for route in existing_routes:
    app.routes.remove(route)

# Override the root route to serve our frontend
@app.get("/", include_in_schema=False)
async def serve_frontend():
    """Serve the main medical consultation interface."""
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

# Add alternative route for UI
@app.get("/ui", include_in_schema=False)
async def serve_ui():
    """Alternative route for the medical consultation interface."""
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

if __name__ == "__main__":
    main()