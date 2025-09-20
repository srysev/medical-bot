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
agno - AI agent framework
openai - OpenAI API integration
python-dotenv - Environment variable management
```

## Running the System

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

## Development Notes

- All agents use OpenAI GPT-4o model
- System includes debug mode and response visibility options
- Medical consultations are cached for 30 minutes (1800 seconds)
- Tool-based system includes comprehensive error handling and user experience features