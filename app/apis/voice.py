from fastapi import APIRouter, HTTPException, UploadFile, File
import os
import wave
import collections
import torch
import webrtcvad
import pyaudio
import asyncio
import soundfile as sf
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer
from faster_whisper import WhisperModel
from app.core.config import settings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.core.database import save_response  

router = APIRouter()

# Initialize Faster Whisper (STT)
whisper_model = WhisperModel("small", device="cpu", compute_type="float32")

# Initialize Parler-TTS Model (TTS)
device = "cuda:0" if torch.cuda.is_available() else "cpu"
tts_model = ParlerTTSForConditionalGeneration.from_pretrained("parler-tts/parler-tts-mini-v1").to(device)
tokenizer = AutoTokenizer.from_pretrained("parler-tts/parler-tts-mini-v1")

# Initialize Groq AI (LLM)
llm = ChatGroq(
    groq_api_key=settings.GROQ_API_KEY,
    model="llama-3.1-8b-instant",
    temperature=0.7,
    max_tokens=500,
    timeout=30,
    max_retries=2
)


PROMPT_TEMPLATE = ChatPromptTemplate.from_messages([
    ("system", "You are an AI assistant. Provide a clear and concise response in a single line."),
    ("human", "{user_message}")
])

# Voice Activity Detection (VAD) Class
class VAD:
    def __init__(self, mode=3, sample_rate=16000, frame_duration_ms=30):
        self.vad = webrtcvad.Vad(mode)
        self.sample_rate = sample_rate
        self.frame_duration_ms = frame_duration_ms
        self.frame_size = int(sample_rate * frame_duration_ms / 1000)
        self.ring_buffer = collections.deque(maxlen=30)
        self.triggered = False

    def frame_generator(self):
        """Captures microphone audio for real-time processing."""
        p = pyaudio.PyAudio()
        stream = p.open(format=pyaudio.paInt16,
                        channels=1,
                        rate=self.sample_rate,
                        input=True,
                        frames_per_buffer=self.frame_size)

        while True:
            frame = stream.read(self.frame_size)
            yield frame

    def process_audio(self):
        """Detects speech and transcribes it."""
        frames = []
        for frame in self.frame_generator():
            is_speech = self.vad.is_speech(frame, self.sample_rate)
            if not self.triggered:
                self.ring_buffer.append((frame, is_speech))
                num_voiced = len([f for f, speech in self.ring_buffer if speech])
                if num_voiced > 0.9 * self.ring_buffer.maxlen:
                    self.triggered = True
                    frames.extend([f for f, s in self.ring_buffer])
                    self.ring_buffer.clear()
            else:
                frames.append(frame)
                self.ring_buffer.append((frame, is_speech))
                num_unvoiced = len([f for f, speech in self.ring_buffer if not speech])
                if num_unvoiced > 0.9 * self.ring_buffer.maxlen:
                    self.triggered = False
                    self.ring_buffer.clear()
                    return self.recognize_speech(frames)

    def recognize_speech(self, frames):
        """Saves audio and transcribes it using Faster Whisper."""
        audio_data = b''.join(frames)
        temp_file = "temp_audio.wav"

        with wave.open(temp_file, 'wb') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(self.sample_rate)
            wf.writeframes(audio_data)

        # Transcribe with Faster Whisper
        segments, _ = whisper_model.transcribe(temp_file, beam_size=5)
        transcription = " ".join([segment.text for segment in segments])
        os.remove(temp_file)  
        return transcription

# Function to Convert Text to Speech
def generate_speech(text, description="A natural and clear voice with moderate speed.", output_path="output_audio.wav"):
    """Convert AI-generated text into speech with better quality."""
    input_ids = tokenizer(description, return_tensors="pt").input_ids.to(device)
    prompt_input_ids = tokenizer(text, return_tensors="pt").input_ids.to(device)

    generation = tts_model.generate(input_ids=input_ids, prompt_input_ids=prompt_input_ids)
    audio_arr = generation.cpu().numpy().squeeze()

    sf.write(output_path, audio_arr, tts_model.config.sampling_rate, format='WAV')
    return output_path

async def generate_speech_async(text, description="A natural and clear voice with moderate speed.", output_path="output_audio.wav"):
    """Generate speech asynchronously to avoid API blocking."""
    input_ids = tokenizer(description, return_tensors="pt").input_ids.to(device)
    prompt_input_ids = tokenizer(text, return_tensors="pt").input_ids.to(device)

    loop = asyncio.get_running_loop()
    generation = await loop.run_in_executor(None, lambda: tts_model.generate(input_ids=input_ids, prompt_input_ids=prompt_input_ids))

    audio_arr = generation.cpu().numpy().squeeze()
    sf.write(output_path, audio_arr, tts_model.config.sampling_rate, format='WAV')

    return output_path


@router.post("/stt/")
async def speech_to_text(user_id: str, file: UploadFile = File(...)):
    """🎙 Speech File → Text + AI Speech Response"""
    try:
        # Save uploaded file
        temp_audio_path = f"temp_{file.filename}"
        with open(temp_audio_path, "wb") as buffer:
            buffer.write(file.file.read())

        # Transcribe with Faster Whisper
        segments, _ = whisper_model.transcribe(temp_audio_path, beam_size=5)
        transcribed_text = " ".join([segment.text for segment in segments])

        # Remove temp file after processing
        os.remove(temp_audio_path)

        if not transcribed_text:
            return {"error": "No speech detected"}

        # Send text to Groq AI
        messages = PROMPT_TEMPLATE.format_messages(user_message=transcribed_text)
        ai_response = llm.invoke(messages).content

        # Convert AI response to speech
        audio_file = generate_speech(ai_response)

        # Save response in database
        save_response(user_id, "speech_to_text", transcribed_text, ai_response)

        return {
            "user_id": user_id,
            "transcribed_text": transcribed_text,
            "ai_response": ai_response,
            "audio_file": audio_file
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Text-to-Speech API (Returns Text & Audio)
@router.post("/text-to-tts/")
async def text_to_speech(user_id: str, text: str):
    """💬 Text → Groq AI → Speech + AI Speech Response"""
    try:
        # Send text to Groq AI
        messages = PROMPT_TEMPLATE.format_messages(user_message=text)
        ai_response = llm.invoke(messages).content

        # Convert AI response to speech
        audio_file = generate_speech(ai_response)

        # Save response in database
        save_response(user_id, "text_to_speech", text, ai_response)

        return {
            "user_id": user_id,
            "ai_response": ai_response,
            "audio_file": audio_file
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
