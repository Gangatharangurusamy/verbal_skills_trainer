# Verbal Skills Trainer

## 📝 Overview

Verbal Skills Trainer is an AI-powered web application designed to help users improve their communication skills through interactive exercises, real-time feedback, and comprehensive analysis. The platform leverages advanced AI models to provide personalized coaching and assessment across various verbal communication scenarios.

## 🚀 Features

### 📢 AI Chat Interface
- Engage in real-time conversations with AI personas
- Practice for interviews, debates, negotiations, and casual conversations
- Receive immediate feedback on communication effectiveness
- Chat history tracking and progress monitoring

### 🎙️ Voice Analysis Module
- Convert speech to text with high accuracy
- AI-powered feedback on vocal qualities and speech patterns
- Pronunciation assessment and improvement suggestions
- Real-time audio processing capabilities

### 📚 Skill Training Module
- Guided exercises for storytelling, impromptu speaking, and conflict resolution
- Scenario-based practice with contextual feedback
- Progressive difficulty levels to build confidence
- Customizable training paths based on user goals

### 📊 Presentation Assessment
- Upload audio recordings for comprehensive evaluation
- Analysis of speech clarity, fluency, and pronunciation
- Pacing and tone assessment
- Detailed reports with actionable improvement suggestions

## ⚙️ Tech Stack

### Frontend
- React (Vite)
- TypeScript
- React Router
- React Query

### Backend
- FastAPI
- Groq API for LLM integration
- Faster Whisper for Speech-to-Text
- Parler-TTS for Text-to-Speech
- SQLite for data persistence

## 📂 Project Structure

```
📂 verbal_skills_trainer/
│── 📂 backend/
│   │── 📂 app/
│   │   │── 📂 apis/
│   │   │   │── chat.py               # Chat API (Text-based)
│   │   │   │── voice.py              # Voice Processing API (STT & TTS)
│   │   │   │── skills.py             # Skill Training APIs
│   │   │   │── presentation.py       # Presentation Assessment API
│   │   │   │── progress.py           # Progress Tracking API (Database)
│   │   │   │── error_handler.py      # API Error Handling
│   │   │── 📂 core/
│   │   │   │── config.py             # Environment variables & API keys
│   │   │   │── database.py           # Wrapper for calling Groq API
│   │   │── 📂 database/
│   │   │   │── training_data.db      # SQLite/JSON database for storing progress
│   │   │── main.py                   # Main FastAPI app entry point
│   │── .env                          # Environment variables (API keys, etc.)
│   │── requirements.txt              # Dependencies (FastAPI, Uvicorn, etc.)
│
│── 📂 frontend/
│   │── 📂 node_modules/
│   │── 📂 public/
│   │── 📂 src/
│   │   │── 📂 assets/
│   │   │── 📂 components/
│   │   │── 📂 pages/
│   │   │   │── ChatPage.css
│   │   │   │── ChatPage.tsx
│   │   │   │── dashboard.css
│   │   │   │── Dashboard.tsx
│   │   │   │── PresentationAssessment.tsx
│   │   │   │── SkillTraining.tsx
│   │   │   │── VoiceAnalysis.css
│   │   │   │── VoiceAnalysis.tsx
│   │   │── App.css
│   │   │── App.tsx
│   │   │── index.css
│   │   │── main.tsx
│   │── .gitignore
│   │── eslint.config.js
│   │── index.html
│   │── package-lock.json
│   │── package.json
│   │── tsconfig.app.json
│   │── tsconfig.json
│   │── tsconfig.node.json
│   │── vite.config.ts
│
│── README.md                     # Project Documentation
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- Git

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Gangatharangurusamy/verbal_skills_trainer.git
cd verbal_skills_trainer
```

### 2️⃣ Backend Setup (FastAPI)
```bash
cd verbal_skills_trainer
conda create -p venv python=3.10 -y
conda activate venv
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The backend will run on: http://127.0.0.1:8000

### 3️⃣ Frontend Setup (React)
```bash
cd verbal-skills-trainer
npm install
npm run dev
```
The frontend will run on: http://127.0.0.1:5173

### 4️⃣ Environment Variables
Create a `.env` file inside the `backend/` directory based on the following template:

```
# Backend .env
GROQ_API_KEY=your-api-key-here
```

## 🔄 API Documentation

### Chat Interface

#### `POST /chat/`
Chat with AI based on selected conversation type.

**Request Body:**
```json
{
  "user_id": "string",
  "user_message": "string",
  "conversation_type": "string"
}
```

**Response:**
```json
{
  "bot_response": "string"
}
```

### Voice Analysis

#### `POST /voice/stt/`
Convert speech to text and get AI feedback.

**Parameters:**
- `user_id`: string (query parameter)

**Request Body:**
- `file`: Audio file (multipart/form-data)

**Response:**
```json
"string"  // Response containing transcribed text and AI feedback
```

#### `POST /voice/text-to-tts/`
Convert text to speech via Groq AI.

**Parameters:**
- `user_id`: string (query parameter)
- `text`: string (query parameter)

**Response:**
```json
"string"  // Path to generated audio file or audio data
```

### Skill Training

#### `POST /skills/train/`
Submit text input for skill training and receive AI feedback.

**Request Body:**
```json
{
  "user_id": "string",
  "module": "string",
  "user_response": "string"
}
```

**Response:**
```json
"string"  // AI feedback on the user's response
```

#### `POST /skills/train/voice/`
Submit voice input for skill training and receive AI feedback.

**Parameters:**
- `user_id`: string (query parameter)

**Request Body:**
- `file`: Audio file (multipart/form-data)

**Response:**
```json
"string"  // AI feedback on the user's spoken response
```

### Presentation Assessment

#### `POST /presentation/assess/`
Upload an audio recording for comprehensive evaluation.

**Parameters:**
- `user_id`: string (query parameter)

**Request Body:**
- `file`: Audio file (multipart/form-data)

**Response:**
```json
"string"  // Evaluation of the presentation with metrics and feedback
```

### Progress Tracking

#### `GET /progress/progress/{user_id}`
Retrieve a user's progress across all training modules.

**Parameters:**
- `user_id`: string (path parameter)

**Response:**
```json
"string"
```

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Groq for providing the LLM API
- The FastAPI and React communities for excellent documentation
- Contributors and testers who provided valuable feedback