# from fastapi import APIRouter, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
# import os
# import soundfile as sf
# import asyncio
# from faster_whisper import WhisperModel
# from app.core.config import settings
# from langchain_groq import ChatGroq
# from langchain_core.prompts import ChatPromptTemplate
# from app.core.database import save_response

# router = APIRouter()

# # Load Faster-Whisper (for Speech-to-Text)
# whisper_model = WhisperModel("small", device="cpu", compute_type="float32")

# # Load Groq LLM
# llm = ChatGroq(
#     groq_api_key=settings.GROQ_API_KEY,
#     model="llama-3.1-8b-instant",
#     temperature=0.7,
#     max_tokens=500,
#     timeout=30,
#     max_retries=2
# )

# # Updated Presentation Evaluation Prompt (With Detailed Scoring)
# PRESENTATION_PROMPT = ChatPromptTemplate.from_messages([
#     ("system", "You are an expert speech evaluator. Analyze the user's speech and provide feedback on clarity, fluency, and pronunciation."),
#     ("human", "Speech Transcript: {speech_text}"),
#     ("system", """Provide structured feedback in this JSON format:
#     {
#         "clarity_score": (1-10),
#         "fluency_score": (1-10),
#         "pronunciation_score": (1-10),
#         "overall_feedback": "Detailed feedback here."
#     }""")
# ])

# @router.post("/assess/")
# async def assess_presentation(file: UploadFile = File(...)):
#     """Evaluates the user's spoken presentation and provides AI feedback with structured scoring."""
#     try:
#         # Save uploaded audio file temporarily
#         temp_audio_path = f"temp_presentation_{file.filename}"
#         with open(temp_audio_path, "wb") as buffer:
#             buffer.write(file.file.read())

#         # Convert speech to text using Faster-Whisper
#         segments, _ = whisper_model.transcribe(temp_audio_path, beam_size=5)
#         speech_text = " ".join([segment.text for segment in segments])

#         # Remove temp file after processing
#         os.remove(temp_audio_path)

#         if not speech_text:
#             raise HTTPException(status_code=400, detail="No speech detected in the uploaded file.")

#         # Send transcribed speech to Groq AI for evaluation
#         messages = PRESENTATION_PROMPT.format_messages(speech_text=speech_text)
#         ai_feedback = llm.invoke(messages).content

#         # Save assessment in database
#         save_response("user_presentation", "presentation_assessment", speech_text, ai_feedback)

#         return {
#             "speech_text": speech_text,
#             "ai_feedback": ai_feedback
#         }

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# @router.websocket("/assess/stream")
# async def real_time_assessment(websocket: WebSocket):
#     """Real-time speech assessment using Faster-Whisper streaming."""
#     await websocket.accept()
#     try:
#         while True:
#             audio_chunk = await websocket.receive_bytes()

#             # Save temporary audio chunk
#             temp_audio_path = "temp_chunk.wav"
#             with open(temp_audio_path, "wb") as buffer:
#                 buffer.write(audio_chunk)

#             # Process speech-to-text in real-time
#             segments, _ = whisper_model.transcribe(temp_audio_path, beam_size=5, stream=True)
#             transcribed_text = " ".join([segment.text for segment in segments])

#             # Delete temp audio chunk after processing
#             os.remove(temp_audio_path)

#             if transcribed_text:
#                 # Send transcribed text to AI for evaluation
#                 messages = PRESENTATION_PROMPT.format_messages(speech_text=transcribed_text)
#                 ai_feedback = llm.invoke(messages).content

#                 # Send real-time feedback to client
#                 await websocket.send_json({
#                     "transcribed_text": transcribed_text,
#                     "ai_feedback": ai_feedback
#                 })

#     except WebSocketDisconnect:
#         print("WebSocket connection closed.")


from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import json
import librosa
import numpy as np
from app.apis.voice import generate_speech
from app.core.config import settings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.core.database import save_response
from app.apis.voice import whisper_model  # ✅ Import STT directly

router = APIRouter()

# ✅ Load Groq AI
llm = ChatGroq(
    groq_api_key=settings.GROQ_API_KEY,
    model="llama-3.1-8b-instant",
    temperature=0.7,
    max_tokens=500,
    timeout=30,
    max_retries=2
)

# ✅ Improved Evaluation Prompt
PRESENTATION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a professional speech evaluator. Analyze the user's speech based on clarity, fluency, and pronunciation."),
    ("human", """
    User ID: {user_id}
    Speech Transcript: {speech_text}
    Speech Rate: {speech_rate}
    MFCC Features: {mfcc_features}
    """),
    ("system", "Provide a structured response with detailed feedback.")
])

def extract_audio_features(audio_file):
    """Extracts speech rate and MFCC features from audio."""
    y, sr = librosa.load(audio_file, sr=16000)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    mfcc = np.mean(librosa.feature.mfcc(y=y, sr=sr), axis=1)

    return {
        "speech_rate": round(float(tempo), 2),  # ✅ Convert tempo to float before rounding
        "mfcc_features": [round(float(val), 2) for val in mfcc]  # ✅ Convert MFCC values to float before rounding
    }

@router.post("/assess/")
async def assess_presentation(user_id: str, file: UploadFile = File(...)):
    """🎤 Evaluates spoken presentations with AI feedback & speech analysis."""
    try:
        # ✅ Save & Process Audio File
        temp_audio_path = f"temp_upload_{file.filename}"
        with open(temp_audio_path, "wb") as buffer:
            buffer.write(file.file.read())

        # ✅ Convert Speech to Text (Use Direct Whisper Call)
        segments, _ = whisper_model.transcribe(temp_audio_path, beam_size=5)
        speech_text = " ".join([segment.text for segment in segments])

        # ✅ Check if speech was detected
        if not speech_text:
            os.remove(temp_audio_path)  # Cleanup before returning
            raise HTTPException(status_code=400, detail="No speech detected.")

        # ✅ Extract Audio Features (Speech Rate & MFCC)
        audio_features = extract_audio_features(temp_audio_path)
        os.remove(temp_audio_path)  # ✅ Cleanup temp file after feature extraction

        # ✅ Send Both Text & Audio Features to LLM
        messages = PRESENTATION_PROMPT.format_messages(
            user_id=user_id,
            speech_text=json.dumps({"text": speech_text}),
            speech_rate=audio_features["speech_rate"],
            mfcc_features=audio_features["mfcc_features"]
        )
        ai_feedback = llm.invoke(messages).content

        # ✅ Convert AI Feedback to Speech
        audio_file = generate_speech(ai_feedback)

        # ✅ Save assessment in database
        save_response(user_id, "presentation_assessment", speech_text, ai_feedback)

        return {
            "user_id": user_id,
            "speech_text": speech_text,
            "speech_rate": audio_features["speech_rate"],
            "mfcc_features": audio_features["mfcc_features"],
            "ai_feedback": ai_feedback,
            "audio_file": audio_file
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
