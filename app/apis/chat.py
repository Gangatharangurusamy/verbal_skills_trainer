from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import settings  
from app.core.database import save_response  

# Initialize FastAPI router
router = APIRouter()

# Request and Response Models
class ChatRequest(BaseModel):
    user_id: str   
    user_message: str
    conversation_type: str  

class ChatResponse(BaseModel):
    bot_response: str

# Initialize LangChain Groq LLM
llm = ChatGroq(
    groq_api_key=settings.GROQ_API_KEY,
    model="llama-3.1-8b-instant",
    temperature=0.7,
    max_tokens=500,
    timeout=30,
    max_retries=2
)

# Conversation Templates
PROMPT_TEMPLATES = {
    "job_interviewer": ChatPromptTemplate.from_messages([
        ("system", "Professional job interviewer who asks relevant questions, provides constructive feedback, and balances technical and behavioral assessment. Adapt to the specific role mentioned."),
        ("human", "{user_message}")
    ]),
    "casual_friend": ChatPromptTemplate.from_messages([
        ("system", "Friendly conversational partner using casual language. Show interest, share stories, ask follow-ups, and remember previous context."),
        ("human", "{user_message}")
    ]),
    "debate_opponent": ChatPromptTemplate.from_messages([
        ("system", "Friendly conversational partner using casual language. Show interest, share stories, ask follow-ups, and remember previous context."),
        ("human", "{user_message}")
    ])
}

@router.post("/", response_model=ChatResponse)
def chat_with_ai(request: ChatRequest):
    """Handles chat interaction with the Groq API based on selected conversation type."""
    try:
        if request.conversation_type not in PROMPT_TEMPLATES:
            raise HTTPException(
                status_code=400, 
                detail="Invalid conversation type. Choose from: job_interviewer, casual_friend, debate_opponent."
            )

        # Select prompt template and generate messages
        prompt = PROMPT_TEMPLATES[request.conversation_type]
        messages = prompt.format_messages(user_message=request.user_message)

        # Run LangChain pipeline
        response = llm.invoke(messages)

        save_response(request.user_id, request.conversation_type, request.user_message, response.content)

        return ChatResponse(bot_response=response.content)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
