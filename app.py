# app.py - Medical Bot Web Application using Agno 2.x AgentOS
import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from agno.os import AgentOS
from agno.os.config import AgentOSConfig, ChatConfig

# Import the medical agent
from medical_agent_with_team import create_hausarzt_agent

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

# Add static file serving and frontend routes
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

# Mount static files first
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

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