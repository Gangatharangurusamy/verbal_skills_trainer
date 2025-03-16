from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError



# Initialize FastAPI app
app = FastAPI(title="Verbal Skills Trainer API", version="1.0")

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers after app initialization
from app.apis import chat, voice, skill_training, presentation, progress

# Include routers
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(voice.router, prefix="/voice", tags=["Voice"])
app.include_router(skill_training.router, prefix="/skills", tags=["Skill Training"])
app.include_router(presentation.router, prefix="/presentation", tags=["Presentation Assessment"])
app.include_router(progress.router, prefix="/progress", tags=["User Progress"])  # Added Progress API



@app.get("/")
def read_root():
    """Root endpoint to check API health."""
    return {"message": "Welcome to the Verbal Skills Trainer API!"}

