# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a medical AI consultation system built with the Agno framework that simulates a European primary care environment. The system provides multi-agent medical analysis through specialized AI agents coordinated by a family doctor interface.

## Core Architecture

### Main Implementation

- **medical_agent_with_team.py** - Advanced medical consultation system with custom tools and session management

### Agent Architecture

The system uses 5 specialized medical agents:

- **Triage Agent** - Emergency assessment and priority determination
- **Clinical Assessment Agent** - Complete symptom evaluation and history analysis
- **Diagnostic Agent** - Differential diagnosis and clinical reasoning
- **Investigation Agent** - Recommended tests and examinations
- **Treatment Agent** - Evidence-based treatment recommendations

### Team Coordination

- Uses custom tool-based architecture with:
  - `consult_medical_team()` tool for accessing specialist team
  - Dr. Hausarzt agent as patient interface
  - Session management with InMemoryDb
  - Interactive consultation workflow

## Dependencies

```
agno>=2.0.7 - AI agent framework with AgentOS
openai - OpenAI API integration
python-dotenv - Environment variable management
fastapi - Web framework for AgentOS backend
uvicorn - ASGI server
```

## Running the System

### Web Application (Recommended)
```bash
python app.py
```

- **Web Interface**: http://localhost:8080
- **API Documentation**: http://localhost:8080/docs
- **Professional Chat UI**: Modern medical consultation interface with markdown support
- **Features**:
  - Real-time chat with Dr. Hausarzt
  - Automatic specialist team consultation
  - Markdown-formatted medical advice
  - Session continuity across conversations

### Command Line Interface (Development)
```bash
python medical_agent_with_team.py
```

The system provides an interactive consultation interface where:
- Dr. Hausarzt conducts patient interviews
- System automatically consults specialist team when appropriate
- Results are translated into patient-friendly language

## Key Design Patterns

### European Medical Standards
All agents follow European primary care guidelines and medical standards rather than US-based approaches.

### Workflow Structure
1. Triage assessment for urgency
2. Clinical symptom evaluation
3. Differential diagnosis generation
4. Investigation recommendations
5. Treatment planning

### Session Management
The system uses session IDs to maintain conversation context and enable multi-turn consultations.

## Reference Documentation

- **Agno Framework Documentation**: `~/Downloads/Agno-Framework-Anweisung.md` - Comprehensive guide for Agno framework usage, including agent creation, memory management, and SQLite/PostgreSQL database integration

## Technical Architecture

### Frontend (Web UI)
- **HTML/CSS/JS**: Modern responsive medical consultation interface
- **Markdown Rendering**: marked.js for professional formatting of medical advice
- **Real-time Communication**: Direct API calls to AgentOS backend
- **Session Management**: Browser-based session continuity

### Backend (AgentOS 2.x)
- **AgentOS**: Modern Agno 2.x architecture with integrated web server
- **API Structure**: RESTful endpoints with OpenAPI documentation
- **Agent Integration**: Direct access to Dr. Hausarzt and specialist team
- **Data Format**: multipart/form-data for API communication

### File Structure
```
medical-bot/
├── app.py                          # AgentOS web application
├── medical_agent_with_team.py      # Medical specialist team implementation
├── static/                         # Frontend assets
│   ├── index.html                  # Chat interface
│   ├── app.js                      # API communication & markdown rendering
│   └── styles.css                  # Medical-themed styling
├── requirements.txt                # Python dependencies
└── CLAUDE.md                       # This documentation
```

## Deployment

### Docker Deployment to GCP Cloud Run

```bash
# Deploy without authentication
./deploy.sh

# Deploy with authentication
./deploy.sh "AUTH_PASSWORD" "COOKIE_SECRET"
```

**Prerequisites:**
- Docker installed and authenticated to GCP
- gcloud CLI configured for project: openai-experiments-373016
- OpenAI API key secret: kyrill_chat_app_openai-api-key

**Deployment Details:**
- **Image**: gcr.io/openai-experiments-373016/medical-bot
- **Service**: medical-bot (europe-west1)
- **Service Account**: application-service-account@openai-experiments-373016.iam.gserviceaccount.com
- **Port**: 8080 (hardcoded for production)

## Development & Debugging

### Local Development
```bash
python app.py
```
- Web Interface: http://localhost:8080
- API Documentation: http://localhost:8080/docs

### GCP Logs Monitoring
```bash
# Check Cloud Run logs for medical-bot service
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="medical-bot"' --limit=50 --format="table(timestamp,severity,textPayload)" --project=openai-experiments-373016

# Real-time log streaming
gcloud logging tail 'resource.type="cloud_run_revision" AND resource.labels.service_name="medical-bot"' --project=openai-experiments-373016
```

**Log Contents:**
- Agent consultation logs (multi-agent team operations)
- OpenAI API calls and responses
- Patient session management
- Treatment recommendations in multiple languages

## Development Notes

- All agents use OpenAI GPT-4o model
- System includes debug mode and response visibility options
- Medical consultations are cached for 30 minutes (1800 seconds)
- Tool-based system includes comprehensive error handling and user experience features
- Web interface supports markdown formatting for professional medical advice presentation