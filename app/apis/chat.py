# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from langchain_groq import ChatGroq
# from langchain_core.prompts import ChatPromptTemplate
# from app.core.config import settings  # Import settings with API key

# # Initialize FastAPI router
# router = APIRouter()

# # Request and Response Models
# class ChatRequest(BaseModel):
#     user_message: str
#     conversation_type: str  # Choose from job_interviewer, casual_friend, debate_opponent

# class ChatResponse(BaseModel):
#     bot_response: str

# # Initialize LangChain Groq LLM
# llm = ChatGroq(
#     groq_api_key=settings.GROQ_API_KEY,
#     model="llama-3.1-8b-instant",
#     temperature=0.7,
#     max_tokens=500,
#     timeout=30,
#     max_retries=2
# )

# # Conversation Templates
# PROMPT_TEMPLATES = {
#     "job_interviewer": ChatPromptTemplate.from_messages([
#         ("system", "You are a professional job interviewer conducting a mock interview."),
#         ("human", "{user_message}")
#     ]),
#     "casual_friend": ChatPromptTemplate.from_messages([
#         ("system", "You are a friendly conversation partner engaging in casual talk."),
#         ("human", "{user_message}")
#     ]),
#     "debate_opponent": ChatPromptTemplate.from_messages([
#         ("system", "You are a debate opponent. Challenge the user's arguments logically."),
#         ("human", "{user_message}")
#     ])
# }

# @router.post("/", response_model=ChatResponse)
# def chat_with_ai(request: ChatRequest):
#     """Handles chat interaction with the Groq API based on selected conversation type."""
#     try:
#         if request.conversation_type not in PROMPT_TEMPLATES:
#             raise HTTPException(
#                 status_code=400, 
#                 detail="Invalid conversation type. Choose from: job_interviewer, casual_friend, debate_opponent."
#             )

#         # Select prompt template and generate messages
#         prompt = PROMPT_TEMPLATES[request.conversation_type]
#         messages = prompt.format_messages(user_message=request.user_message)

#         # Run LangChain pipeline
#         response = llm.invoke(messages)

#         return ChatResponse(bot_response=response.content)

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import settings  # Import settings with API key
from app.core.database import save_response  # ✅ Import save_response function

# Initialize FastAPI router
router = APIRouter()

# Request and Response Models
class ChatRequest(BaseModel):
    user_id: str  # ✅ Added user_id
    user_message: str
    conversation_type: str  # Choose from job_interviewer, casual_friend, debate_opponent

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
        ("system", "You are a professional job interviewer conducting a mock interview."),
        ("human", "{user_message}")
    ]),
    "casual_friend": ChatPromptTemplate.from_messages([
        ("system", "You are a friendly conversation partner engaging in casual talk."),
        ("human", "{user_message}")
    ]),
    "debate_opponent": ChatPromptTemplate.from_messages([
        ("system", "You are a debate opponent. Challenge the user's arguments logically."),
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

        # ✅ Save user response and AI feedback in the database
        save_response(request.user_id, request.conversation_type, request.user_message, response.content)

        return ChatResponse(bot_response=response.content)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
