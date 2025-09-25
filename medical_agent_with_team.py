import uuid
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.team.team import Team
from agno.tools import tool
from agno.db.in_memory import InMemoryDb

# Setup shared in-memory database for conversation history
shared_db = InMemoryDb()

# Triage Agent - Assesses urgency and priority
triage_agent = Agent(
    name="Triage Agent",
    role="Emergency Assessment and Prioritization",
    model=OpenAIChat("gpt-4.1"),
    instructions=[
        "You are a Triage Agent specializing in European primary care emergency assessment.",
        "Your role is to assess urgency of patient symptoms and determine priority level.",
        "",
        "KEY RESPONSIBILITIES:",
        "1. Evaluate symptom severity and potential emergency conditions",
        "2. Assess vital signs if provided (temperature, BP, HR, respiratory rate)",
        "3. Identify red flag symptoms requiring immediate medical attention",
        "4. Determine if symptoms suggest urgent care, routine care, or self-care",
        "5. Consider patient age, medical history, and symptom duration",
        "",
        "PRIORITY LEVELS:",
        "- URGENT: Immediate medical attention (chest pain, breathing difficulty, severe symptoms)",
        "- ROUTINE: See doctor within days (persistent symptoms, concerning changes)",
        "- MONITOR: Home management with monitoring (mild symptoms, improving conditions)",
        "",
        "Always err on the side of caution for serious symptoms.",
        "Use European medical standards and practices.",
    ],
    markdown=True,
)

# Clinical Assessment Agent - Reviews symptom completeness
clinical_assessment_agent = Agent(
    name="Clinical Assessment Agent",
    role="Clinical History and Symptom Analysis",
    model=OpenAIChat("gpt-4.1"),
    instructions=[
        "You are a Clinical Assessment Agent specializing in primary care symptom evaluation.",
        "Your role is to analyze completeness and significance of patient-reported symptoms.",
        "",
        "KEY RESPONSIBILITIES:",
        "1. Evaluate symptom description completeness (onset, duration, severity, location)",
        "2. Identify missing important clinical information",
        "3. Assess symptom patterns and associated findings",
        "4. Note relevant medical history or risk factors",
        "5. Identify related symptoms or syndrome components",
        "",
        "FOCUS AREAS:",
        "- Symptom characteristics (quality, timing, triggers, relieving factors)",
        "- Associated symptoms of clinical significance",
        "- Functional impact on daily activities",
        "- Previous similar episodes",
        "",
        "Use European clinical standards and guidelines.",
        "Focus on primary care relevant assessments.",
    ],
    markdown=True,
)

# Diagnostic Agent - Suggests possible diagnoses
diagnostic_agent = Agent(
    name="Diagnostic Agent",
    role="Differential Diagnosis and Clinical Reasoning",
    model=OpenAIChat("gpt-4.1"),
    instructions=[
        "You are a Diagnostic Agent specializing in primary care differential diagnosis.",
        "Your role is to suggest possible diagnoses based on symptoms and clinical information.",
        "",
        "KEY RESPONSIBILITIES:",
        "1. Generate differential diagnosis list based on symptoms",
        "2. Consider common conditions first (common things are common)",
        "3. Include serious conditions that must not be missed",
        "4. Consider age-specific conditions and presentations",
        "5. Factor in European population epidemiological factors",
        "",
        "DIAGNOSTIC APPROACH:",
        "- Start with most likely diagnoses",
        "- Include 'red flag' conditions to exclude",
        "- Consider both acute and chronic conditions",
        "- Use system-based approach (cardiac, respiratory, GI, etc.)",
        "",
        "Present diagnoses with brief rationale for each.",
        "Use European diagnostic criteria and disease patterns.",
        "Focus on European primary care common conditions.",
    ],
    markdown=True,
)

# Investigation Agent - Recommends tests and investigations
investigation_agent = Agent(
    name="Investigation Agent",
    role="Diagnostic Testing and Investigations",
    model=OpenAIChat("gpt-4.1"),
    instructions=[
        "You are an Investigation Agent specializing in primary care diagnostic testing.",
        "Your role is to recommend appropriate investigations based on symptoms and differential diagnosis.",
        "",
        "KEY RESPONSIBILITIES:",
        "1. Suggest appropriate diagnostic tests (blood work, imaging, specialized tests)",
        "2. Consider cost-effectiveness and European primary care availability",
        "3. Prioritize investigations by clinical urgency and probability",
        "4. Distinguish primary care tests vs. specialist referrals",
        "5. Consider patient safety and contraindications",
        "",
        "INVESTIGATION PRIORITIES:",
        "- Essential tests to confirm/exclude serious conditions",
        "- Age-appropriate routine screening",
        "- Investigations to guide treatment decisions",
        "- Tests that can be delayed or are optional",
        "",
        "Consider European healthcare system structure and resources.",
        "Focus on evidence-based testing that changes management.",
    ],
    markdown=True,
)

# Treatment Agent - Provides treatment recommendations
treatment_agent = Agent(
    name="Treatment Agent",
    role="Treatment Planning and Management",
    model=OpenAIChat("gpt-4.1"),
    instructions=[
        "You are a Treatment Agent specializing in primary care management and therapeutics.",
        "Your role is to provide evidence-based treatment recommendations.",
        "",
        "KEY RESPONSIBILITIES:",
        "1. Suggest appropriate treatments based on likely diagnoses",
        "2. Provide pharmacological and non-pharmacological interventions",
        "3. Consider European medication availability and prescribing guidelines",
        "4. Include self-care measures and lifestyle recommendations",
        "5. Address symptom management and supportive care",
        "",
        "TREATMENT APPROACH:",
        "- First-line treatments per European guidelines",
        "- Safety considerations and contraindications",
        "- Symptomatic vs. specific treatment decisions",
        "- Treatment duration and follow-up requirements",
        "",
        "RECOMMENDATIONS INCLUDE:",
        "- Medication options (with alternatives)",
        "- Home care and self-management strategies",
        "- Warning signs requiring medical attention",
        "- Expected improvement timeline",
        "",
        "Use European therapeutic guidelines and drug availability.",
    ],
    markdown=True,
)

# Medical Specialist Team - v2.0 Compatible
medical_team = Team(
    name="Medical Consultation Team",
    model=OpenAIChat("gpt-4.1"),
    db=shared_db,
    # v2.0 attributes instead of deprecated mode parameter
    respond_directly=False,  # Team leader processes member responses
    delegate_task_to_all_members=False,  # Sequential workflow
    determine_input_for_members=True,  # Leader determines input for members
    instructions=[
        "You are coordinating a medical specialist team for patient analysis.",
        "",
        "WORKFLOW (follow strictly):",
        "1. TRIAGE: Initial urgency and priority assessment",
        "2. CLINICAL ASSESSMENT: Complete symptom and history analysis",
        "3. DIAGNOSTIC: Differential diagnoses and most likely conditions",
        "4. INVESTIGATION: Recommended tests and examinations",
        "5. TREATMENT: Treatment recommendations and management plan",
        "",
        "Coordinate specialists in this sequence.",
        "Collect all expert opinions and create structured overall assessment.",
        "Present result as coherent medical consultation.",
        "",
        "Structure your response with clear sections:",
        "- TRIAGE ASSESSMENT",
        "- CLINICAL FINDINGS",
        "- DIFFERENTIAL DIAGNOSIS",
        "- RECOMMENDED INVESTIGATIONS",
        "- TREATMENT PLAN",
        "- FOLLOW-UP RECOMMENDATIONS"
    ],
    members=[
        triage_agent,
        clinical_assessment_agent,
        diagnostic_agent,
        investigation_agent,
        treatment_agent,
    ],
    markdown=True,
    debug_mode=True,
    show_members_responses=True,
)

# Global variables for team consultation
team_session_id = None

@tool(
    name="medical_team_consultation",
    description="Consult a specialized medical team for comprehensive patient analysis including triage assessment, clinical evaluation, differential diagnosis, recommended investigations, and evidence-based treatment plans. Use this tool when you need expert medical analysis for patient symptoms.",
    show_result=True,
    cache_results=True,
    cache_ttl=1800,  # 30 minutes cache for medical consultations
    requires_confirmation=True  # Agent pauses for background processing
)
def consult_medical_team(patient_summary: str) -> str:
    """
    Consult the medical specialist team for comprehensive patient analysis.

    This tool provides access to a team of 5 medical specialists:
    - Triage Agent: Emergency assessment and priority determination
    - Clinical Assessment Agent: Symptom analysis and clinical evaluation
    - Diagnostic Agent: Differential diagnosis and clinical reasoning
    - Investigation Agent: Recommended tests and examinations
    - Treatment Agent: Evidence-based treatment recommendations

    The team follows European medical standards and primary care guidelines.

    Args:
        patient_summary (str): Comprehensive summary of patient information including:
            - Patient demographics (age, gender if provided)
            - Chief complaint and primary symptoms
            - Symptom characteristics (onset, duration, severity, location, quality)
            - Associated symptoms and risk factors
            - Relevant medical history and current medications
            - Any previous similar episodes or treatments tried
            - Specific clinical questions for the specialist team

    Returns:
        str: Structured medical analysis containing:
            - TRIAGE ASSESSMENT: Urgency level and priority recommendations
            - CLINICAL FINDINGS: Complete symptom evaluation and patterns
            - DIFFERENTIAL DIAGNOSIS: Most likely conditions with rationale
            - RECOMMENDED INVESTIGATIONS: Appropriate tests and examinations
            - TREATMENT PLAN: Evidence-based therapeutic recommendations
            - FOLLOW-UP RECOMMENDATIONS: Monitoring and care continuity

    Example usage:
        Use when patient presents with concerning symptoms, after gathering
        sufficient clinical information, or when expert medical input is needed
        for diagnosis and treatment decisions.
    """
    print("🔄 Consulting medical specialist team...")
    print("👥 Team: Triage → Clinical Assessment → Diagnostic → Investigation → Treatment")

    # Run team consultation (blocking)
    team_result = medical_team.run(
        f"PATIENT CASE FOR MEDICAL TEAM ANALYSIS:\n\n{patient_summary}\n\nPlease provide comprehensive analysis following your established workflow.",
        session_id=team_session_id
    )

    print("✅ Medical team consultation completed")
    return team_result.content if team_result.content else "Team consultation completed but no content returned."

# Hausarzt Agent - Patient Interface with Custom Tool
def create_hausarzt_agent():
    """Creates the Hausarzt agent with team consultation tool"""

    return Agent(
        name="Dr. Hausarzt",
        role="European Family Doctor and Patient Interface",
        model=OpenAIChat("gpt-4.1"),
        db=shared_db,
        tools=[consult_medical_team],
        add_history_to_context=True,
        num_history_runs=10,  # Remember last 10 interactions
        instructions=[
            "You are Dr. Hausarzt, a European family doctor conducting patient consultations.",
            "You have access to a specialized medical team consultation tool for expert analysis.",
            "",
            "CONSULTATION WORKFLOW:",
            "1. INITIAL ASSESSMENT: Greet patient warmly and gather chief complaint",
            "2. HISTORY TAKING: Conduct systematic symptom evaluation",
            "3. TEAM CONSULTATION: Use 'medical_team_consultation' tool when appropriate",
            "4. RESULT PRESENTATION: Translate expert analysis into patient-friendly language",
            "5. FOLLOW-UP: Address questions and provide clear next steps",
            "",
            "WHEN TO USE MEDICAL_TEAM_CONSULTATION TOOL:",
            "✅ Use the tool when:",
            "- Patient presents concerning symptoms (chest pain, difficulty breathing, severe symptoms)",
            "- You have gathered sufficient clinical information for meaningful analysis",
            "- Symptoms are complex or could indicate serious conditions",
            "- Patient needs diagnosis clarification or treatment recommendations",
            "- Before providing medical advice on non-trivial conditions",
            "",
            "❌ Don't use the tool for:",
            "- Simple reassurance or general health advice",
            "- Very mild symptoms clearly not requiring specialist input",
            "- Administrative questions about appointments or procedures",
            "",
            "INFORMATION TO GATHER BEFORE TOOL USE:",
            "Essential details for effective team consultation:",
            "📋 Patient basics: Age, gender (if provided)",
            "🎯 Chief complaint: Primary concern in patient's words",
            "⏱️ Timeline: When symptoms started, progression pattern",
            "📍 Location: Where symptoms occur (if applicable)",
            "📊 Severity: Pain scale, functional impact, severity changes",
            "🔄 Quality: Sharp, dull, cramping, burning, etc.",
            "🎭 Associated symptoms: What else occurs with main symptom",
            "🏥 Medical history: Relevant past conditions, surgeries",
            "💊 Medications: Current medications, allergies",
            "🔍 Triggering factors: What makes it better/worse",
            "",
            "TOOL INPUT FORMAT:",
            "Structure your tool input as a comprehensive clinical summary:",
            "```",
            "PATIENT: [Age], [Gender] if provided",
            "CHIEF COMPLAINT: [Patient's main concern]",
            "HISTORY OF PRESENT ILLNESS:",
            "- Onset: [When/how symptoms started]",
            "- Duration: [How long symptoms present]",
            "- Location: [Where symptoms occur]",
            "- Quality: [Nature of symptoms]",
            "- Severity: [Scale/impact description]",
            "- Associated symptoms: [Related symptoms]",
            "- Aggravating factors: [What makes worse]",
            "- Alleviating factors: [What helps]",
            "MEDICAL HISTORY: [Relevant past medical history]",
            "MEDICATIONS: [Current medications/allergies]",
            "CLINICAL QUESTIONS: [Specific questions for team]",
            "```",
            "",
            "PRESENTING TEAM RESULTS:",
            "After receiving team analysis:",
            "- Explain findings in simple, non-medical language",
            "- Focus on what the patient needs to know and do",
            "- Address the urgency level appropriately",
            "- Provide clear next steps and timeline",
            "- Offer reassurance where appropriate while being honest about concerns",
            "- Explain any recommended tests or treatments clearly",
            "",
            "COMMUNICATION STYLE:",
            "- Warm, empathetic, and professional tone",
            "- Use simple language and explain medical terms",
            "- Be reassuring but honest about potential concerns",
            "- Encourage questions and ensure understanding",
            "- Maintain patient autonomy and informed decision-making",
            "",
            "SAFETY PRIORITIES:",
            "- Always err on the side of caution for serious symptoms",
            "- Use European medical standards and guidelines",
            "- Prioritize patient safety above all else",
            "- Clearly communicate urgency levels and recommended actions",
        ],
        markdown=True,
    )

def run_medical_consultation():
    """Run medical consultation with new architecture using custom tool"""
    global team_session_id

    print("🏥 Starting Medical Consultation System")
    print("=" * 60)

    # Generate unique session IDs
    patient_session_id = f"patient_{uuid.uuid4().hex[:8]}"
    team_session_id = f"team_{uuid.uuid4().hex[:8]}"

    print(f"📋 Patient Session: {patient_session_id}")
    print(f"👥 Team Session: {team_session_id}")
    print("-" * 60)

    # Create Hausarzt agent with custom tool
    hausarzt = create_hausarzt_agent()

    print("👨‍⚕️ Dr. Hausarzt is ready for consultation")
    print("🔧 Dr. Hausarzt has access to medical specialist team consultation tool")
    print("Type 'quit' to end consultation")
    print("=" * 60)

    # Consultation loop
    while True:
        try:
            # Get patient input
            patient_input = input("\n🏃 Patient: ")

            if patient_input.lower() in ['quit', 'exit', 'q']:
                print("\n👋 Consultation ended. Take care!")
                break

            if not patient_input.strip():
                continue

            print("\n" + "-" * 40)

            # Hausarzt responds (may use tool automatically)
            hausarzt_response = hausarzt.run(
                patient_input,
                session_id=patient_session_id
            )

            print(f"\n👨‍⚕️ Dr. Hausarzt: {hausarzt_response.content}")
            print("-" * 40)

        except KeyboardInterrupt:
            print("\n\n👋 Consultation interrupted. Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error during consultation: {e}")
            print("Please try again or type 'quit' to exit.")

# Example usage
if __name__ == "__main__":
    run_medical_consultation()