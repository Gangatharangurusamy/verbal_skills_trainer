from fastapi import APIRouter, HTTPException
import os
import json
from app.core.database import get_user_responses
from app.core.config import settings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.apis.voice import generate_speech  

# Initialize FastAPI Router
router = APIRouter()

# Initialize LLM Groq AI
llm = ChatGroq(
    groq_api_key=settings.GROQ_API_KEY,
    model="llama-3.1-8b-instant",
    temperature=0.7,
    max_tokens=500,
    timeout=30,
    max_retries=2
)

# Feedback Prompt Template
PROGRESS_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are an expert speech coach. Based on the user's speech history, generate a detailed improvement report."),
    ("human", """
    User ID: {user_id}
    Total Sessions: {total_sessions}
    Average Clarity Score: {average_clarity_score}
    Average Fluency Score: {average_fluency_score}
    Average Pronunciation Score: {average_pronunciation_score}
    """),
    ("system", "Provide a structured analysis including improvements, weaknesses, and personalized recommendations.")
])

@router.get("/progress/{user_id}")
async def get_user_progress(user_id: str):
    """Fetches user's overall speech progress & provides AI feedback (text + speech)."""
    try:
        # Fetch user speech assessments from the database
        user_responses = get_user_responses(user_id)

        # Debugging: Print raw database output
        print(f"🔍 DEBUG - Raw user responses for {user_id}: {user_responses}")

        if not user_responses:
            raise HTTPException(status_code=404, detail=f"No speech data found for user: {user_id}")

        # Extract & Validate Scores
        clarity_scores, fluency_scores, pronunciation_scores = [], [], []

        for response in user_responses:
            missing_fields = [key for key in ["clarity_score", "fluency_score", "pronunciation_score"] if key not in response]

            if missing_fields:
                print(f"⚠️ MISSING FIELDS {missing_fields} in response: {response}")
                raise HTTPException(status_code=500, detail=f"Database records are missing fields: {missing_fields}")

            try:
                clarity_scores.append(float(response["clarity_score"]) if response["clarity_score"] is not None else 0.0)
                fluency_scores.append(float(response["fluency_score"]) if response["fluency_score"] is not None else 0.0)
                pronunciation_scores.append(float(response["pronunciation_score"]) if response["pronunciation_score"] is not None else 0.0)
            except ValueError:
                print(f"⚠️ Invalid value detected in response: {response}")
                raise HTTPException(status_code=500, detail=f"Invalid score value found: {response}")

        if not clarity_scores or not fluency_scores or not pronunciation_scores:
            raise HTTPException(status_code=500, detail="Database records are missing required speech scores.")

        # Calculate Averages
        total_sessions = len(user_responses)
        avg_clarity = round(sum(clarity_scores) / total_sessions, 2)
        avg_fluency = round(sum(fluency_scores) / total_sessions, 2)
        avg_pronunciation = round(sum(pronunciation_scores) / total_sessions, 2)

        # Prepare Progress Data
        progress_data = {
            "user_id": user_id,
            "total_sessions": total_sessions,
            "average_clarity_score": avg_clarity,
            "average_fluency_score": avg_fluency,
            "average_pronunciation_score": avg_pronunciation
        }

        # Debugging: Print extracted progress data
        print(f"🔍 DEBUG - Progress data: {progress_data}")

        # Send progress data to LLM
        messages = PROGRESS_PROMPT.format_messages(progress_data)
        ai_feedback = llm.invoke(messages).content  # LLM Response

        # Generate Speech from AI Feedback
        audio_file = generate_speech(ai_feedback, output_path=f"{user_id}_progress_feedback.wav")

        # Final response
        return {
            "user_id": user_id,
            "total_sessions": total_sessions,
            "average_clarity_score": avg_clarity,
            "average_fluency_score": avg_fluency,
            "average_pronunciation_score": avg_pronunciation,
            "ai_feedback": ai_feedback,
            "audio_file": audio_file
        }

    except HTTPException as e:
        print(f"❌ ERROR - {e.detail}")
        raise e  

    except Exception as e:
        print(f"❌ UNEXPECTED ERROR - {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
