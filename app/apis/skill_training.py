# from fastapi import APIRouter, HTTPException, UploadFile, File
# from pydantic import BaseModel
# from app.core.database import save_response
# from app.core.config import settings
# from langchain_groq import ChatGroq
# from langchain_core.prompts import ChatPromptTemplate
# from app.apis.voice import VAD, whisper_model, generate_speech_async
# import uuid
# import asyncio

# router = APIRouter()

# # Initialize Groq AI Model
# llm = ChatGroq(
#     groq_api_key=settings.GROQ_API_KEY,
#     model="llama-3.1-8b-instant",
#     temperature=0.7,
#     max_tokens=500,
#     timeout=30,
#     max_retries=2
# )

# # Training Modules Prompts
# TRAINING_MODULES = {
#     "impromptu_speaking": ChatPromptTemplate.from_messages([
#         ("system", "You are an AI speech coach. Ask the user to speak on a random topic."),
#         ("human", "Topic: {user_response}"),
#         ("system", "Evaluate their response for structure, clarity, and engagement.")
#     ]),
#     "storytelling": ChatPromptTemplate.from_messages([
#         ("system", "You are an AI storytelling coach. Ask the user to tell a short story."),
#         ("human", "Story: {user_response}"),
#         ("system", "Critique their storytelling flow, vocabulary, and emotional impact.")
#     ]),
#     "conflict_resolution": ChatPromptTemplate.from_messages([
#         ("system", "You are an AI role-playing as a frustrated coworker."),
#         ("human", "The user responds to: 'I’m upset because you missed a deadline'"),
#         ("system", "Evaluate their response on empathy and assertiveness.")
#     ])
# }

# # Request Model (Text Input)
# class SkillTrainingRequest(BaseModel):
#     user_id: str
#     module: str
#     user_response: str

# # Response Model (AI Feedback)
# class SkillTrainingResponse(BaseModel):
#     ai_feedback: str
#     audio_file: str

# @router.post("/train/")
# async def skill_training(request: SkillTrainingRequest):
#     """Handles Skill Training modules (Text Input) and provides AI feedback (Text + Speech)."""
#     try:
#         if request.module not in TRAINING_MODULES:
#             raise HTTPException(
#                 status_code=400,
#                 detail="Invalid module. Choose from: impromptu_speaking, storytelling, conflict_resolution."
#             )

#         # Generate AI feedback
#         prompt = TRAINING_MODULES[request.module]
#         messages = prompt.format_messages(user_response=request.user_response)
#         ai_feedback = llm.invoke(messages).content

#         # Convert AI feedback to speech
#         audio_file = await generate_speech_async(ai_feedback)

#         # Save response & feedback in database
#         save_response(request.user_id, request.module, request.user_response, ai_feedback)

#         return SkillTrainingResponse(ai_feedback=ai_feedback, audio_file=audio_file)

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.post("/train/voice/")
# async def skill_training_voice(file: UploadFile = File(...)):
#     """Handles Skill Training modules (Voice Input) and provides AI feedback (Text + Speech)."""
#     try:
#         # Process speech-to-text
#         vad = VAD()
#         transcribed_text = vad.process_audio()
#         if not transcribed_text:
#             return {"error": "No speech detected"}
        
#         # Send transcribed text to Groq AI
#         messages = TRAINING_MODULES["impromptu_speaking"].format_messages(user_response=transcribed_text)
#         ai_feedback = llm.invoke(messages).content

#         # Convert AI feedback to speech
#         audio_file = await generate_speech_async(ai_feedback)

#         return {
#             "transcribed_text": transcribed_text,
#             "ai_feedback": ai_feedback,
#             "audio_file": audio_file
#         }

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# from fastapi import APIRouter, HTTPException, UploadFile, File
# from pydantic import BaseModel
# from app.core.database import save_response
# from app.core.config import settings
# from langchain_groq import ChatGroq
# from langchain_core.prompts import ChatPromptTemplate
# from app.apis.voice import whisper_model, generate_speech_async
# import os
# import soundfile as sf

# router = APIRouter()

# # Initialize Groq AI Model
# llm = ChatGroq(
#     groq_api_key=settings.GROQ_API_KEY,
#     model="llama-3.1-8b-instant",
#     temperature=0.7,
#     max_tokens=500,
#     timeout=30,
#     max_retries=2
# )

# # Training Modules Prompts
# TRAINING_MODULES = {
#     "impromptu_speaking": ChatPromptTemplate.from_messages([
#         ("system", "You are an AI speech coach. Ask the user to speak on a random topic."),
#         ("human", "Topic: {user_response}"),
#         ("system", "Evaluate their response for structure, clarity, and engagement.")
#     ]),
#     "storytelling": ChatPromptTemplate.from_messages([
#         ("system", "You are an AI storytelling coach. Ask the user to tell a short story."),
#         ("human", "Story: {user_response}"),
#         ("system", "Critique their storytelling flow, vocabulary, and emotional impact.")
#     ]),
#     "conflict_resolution": ChatPromptTemplate.from_messages([
#         ("system", "You are an AI role-playing as a frustrated coworker."),
#         ("human", "The user responds to: 'I’m upset because you missed a deadline'"),
#         ("system", "Evaluate their response on empathy and assertiveness.")
#     ])
# }

# # Request Model (Text Input)
# class SkillTrainingRequest(BaseModel):
#     user_id: str
#     module: str
#     user_response: str

# # Response Model (AI Feedback)
# class SkillTrainingResponse(BaseModel):
#     ai_feedback: str
#     audio_file: str


# @router.post("/train/")
# async def skill_training(request: SkillTrainingRequest):
#     """Handles Skill Training modules (Text Input) and provides AI feedback (Text + Speech)."""
#     try:
#         if request.module not in TRAINING_MODULES:
#             raise HTTPException(
#                 status_code=400,
#                 detail="Invalid module. Choose from: impromptu_speaking, storytelling, conflict_resolution."
#             )

#         # Generate AI feedback
#         prompt = TRAINING_MODULES[request.module]
#         messages = prompt.format_messages(user_response=request.user_response)
#         ai_feedback = llm.invoke(messages).content

#         # Convert AI feedback to speech
#         audio_file = await generate_speech_async(ai_feedback)

#         # Save response & feedback in database
#         save_response(request.user_id, request.module, request.user_response, ai_feedback)

#         return SkillTrainingResponse(ai_feedback=ai_feedback, audio_file=audio_file)

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# @router.post("/train/voice/")
# async def skill_training_voice(file: UploadFile = File(...)):
#     """Handles Skill Training modules (Voice Input) and provides AI feedback (Text + Speech)."""
#     try:
#         # Save uploaded file temporarily
#         temp_audio_path = f"temp_upload_{file.filename}"
#         with open(temp_audio_path, "wb") as buffer:
#             buffer.write(file.file.read())

#         # Process speech-to-text using Faster-Whisper
#         segments, _ = whisper_model.transcribe(temp_audio_path, beam_size=5)
#         transcribed_text = " ".join([segment.text for segment in segments])

#         # Remove temp file after processing
#         os.remove(temp_audio_path)

#         if not transcribed_text:
#             raise HTTPException(status_code=400, detail="No speech detected in the uploaded file.")

#         # Send transcribed text to Groq AI
#         messages = TRAINING_MODULES["impromptu_speaking"].format_messages(user_response=transcribed_text)
#         ai_feedback = llm.invoke(messages).content

#         # Convert AI feedback to speech
#         audio_file = await generate_speech_async(ai_feedback)

#         return {
#             "transcribed_text": transcribed_text,
#             "ai_feedback": ai_feedback,
#             "audio_file": audio_file
#         }

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from app.core.database import save_response
from app.core.config import settings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.apis.voice import whisper_model, generate_speech_async
import os
import soundfile as sf

router = APIRouter()

# Initialize Groq AI Model
llm = ChatGroq(
    groq_api_key=settings.GROQ_API_KEY,
    model="llama-3.1-8b-instant",
    temperature=0.7,
    max_tokens=500,
    timeout=30,
    max_retries=2
)

# Training Modules Prompts
TRAINING_MODULES = {
    "impromptu_speaking": ChatPromptTemplate.from_messages([
        ("system", "You are an AI speech coach. Ask the user to speak on a random topic."),
        ("human", "Topic: {user_response}"),
        ("system", "Evaluate their response for structure, clarity, and engagement.")
    ]),
    "storytelling": ChatPromptTemplate.from_messages([
        ("system", "You are an AI storytelling coach. Ask the user to tell a short story."),
        ("human", "Story: {user_response}"),
        ("system", "Critique their storytelling flow, vocabulary, and emotional impact.")
    ]),
    "conflict_resolution": ChatPromptTemplate.from_messages([
        ("system", "You are an AI role-playing as a frustrated coworker."),
        ("human", "The user responds to: 'I’m upset because you missed a deadline'"),
        ("system", "Evaluate their response on empathy and assertiveness.")
    ])
}

# Request Model (Text Input)
class SkillTrainingRequest(BaseModel):
    user_id: str
    module: str
    user_response: str

# Response Model (AI Feedback)
class SkillTrainingResponse(BaseModel):
    ai_feedback: str
    audio_file: str


@router.post("/train/")
async def skill_training(request: SkillTrainingRequest):
    """Handles Skill Training modules (Text Input) and provides AI feedback (Text + Speech)."""
    try:
        if request.module not in TRAINING_MODULES:
            raise HTTPException(
                status_code=400,
                detail="Invalid module. Choose from: impromptu_speaking, storytelling, conflict_resolution."
            )

        # Generate AI feedback
        prompt = TRAINING_MODULES[request.module]
        messages = prompt.format_messages(user_response=request.user_response)
        ai_feedback = llm.invoke(messages).content

        # Convert AI feedback to speech
        audio_file = await generate_speech_async(ai_feedback)

        # ✅ Save response & feedback in database
        save_response(request.user_id, request.module, request.user_response, ai_feedback)

        return SkillTrainingResponse(ai_feedback=ai_feedback, audio_file=audio_file)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/train/voice/")
async def skill_training_voice(user_id: str, file: UploadFile = File(...)):
    """Handles Skill Training modules (Voice Input) and provides AI feedback (Text + Speech)."""
    try:
        # Save uploaded file temporarily
        temp_audio_path = f"temp_upload_{file.filename}"
        with open(temp_audio_path, "wb") as buffer:
            buffer.write(file.file.read())

        # Process speech-to-text using Faster-Whisper
        segments, _ = whisper_model.transcribe(temp_audio_path, beam_size=5)
        transcribed_text = " ".join([segment.text for segment in segments])

        # Remove temp file after processing
        os.remove(temp_audio_path)

        if not transcribed_text:
            raise HTTPException(status_code=400, detail="No speech detected in the uploaded file.")

        # Send transcribed text to Groq AI
        messages = TRAINING_MODULES["impromptu_speaking"].format_messages(user_response=transcribed_text)
        ai_feedback = llm.invoke(messages).content

        # Convert AI feedback to speech
        audio_file = await generate_speech_async(ai_feedback)

        # ✅ Save response & feedback in database
        save_response(user_id, "impromptu_speaking", transcribed_text, ai_feedback)

        return {
            "transcribed_text": transcribed_text,
            "ai_feedback": ai_feedback,
            "audio_file": audio_file
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
