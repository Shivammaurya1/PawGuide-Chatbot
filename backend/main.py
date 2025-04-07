from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import google.generativeai as genai
import os
from dotenv import load_dotenv
import re
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Configure the Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set")

genai.configure(api_key=api_key)

model = genai.GenerativeModel('gemini-1.5-flash')

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    role: str
    content: str

class PetContext(BaseModel):
    name: str
    type: str
    breed: Optional[str] = None
    age: Optional[str] = None
    notes: Optional[str] = None

class ChatRequest(BaseModel):
    messages: List[Message]
    petContext: Optional[PetContext] = None

class ChatResponse(BaseModel):
    text: str

# function to check if a query is pet-related
def is_pet_related(query: str) -> bool:
    pet_keywords = [
        "thanks", "hi", "hello", "why", "what", "who"
        "pet", "dog", "cat", "bird", "fish", "rabbit", "hamster", "guinea pig",
        "animal", "veterinarian", "vet", "breed", "food", "feed", "training",
        "behavior", "health", "care", "groom", "walk", "toy", "treat", "leash",
        "collar", "cage", "aquarium", "terrarium", "medicine", "vaccination",
        "puppy", "kitten", "adoption", "shelter", "rescue", "spay", "neuter"
    ]
    
    query_lower = query.lower()
    return any(keyword in query_lower for keyword in pet_keywords)

# Format response with markdown
def format_with_markdown(text: str) -> str:
    # Add proper markdown formatting
    
    # Format headings if they don't already have markdown
    if not re.search(r'^#+ ', text, re.MULTILINE):
        # Look for title-like sentences and convert them to headings
        text = re.sub(r'^([A-Z][^.!?]*(?:[.!?]|$))', r'## \1', text, flags=re.MULTILINE)
    
    # Format lists if they don't already have markdown
    if not re.search(r'^\s*[-*+] ', text, re.MULTILINE) and not re.search(r'^\s*\d+\. ', text, re.MULTILINE):
        # Convert lines starting with numbers to ordered lists
        text = re.sub(r'^(\d+)[.)] (.+)$', r'\1. \2', text, flags=re.MULTILINE)
        
        # Convert lines starting with bullets to unordered lists
        text = re.sub(r'^[•○◦] (.+)$', r'- \1', text, flags=re.MULTILINE)
    
    # Add emphasis to important terms
    text = re.sub(r'\b(important|note|warning|caution|remember)\b', r'**\1**', text, flags=re.IGNORECASE)
    
    # Add blockquotes for tips and notes
    text = re.sub(r'^(Tip|Note|Warning|Important):(.*?)$', r'> **\1:** \2', text, flags=re.MULTILINE)
    
    return text

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    logging.info("Received chat request")
    try:
        # Get the last user message
        logging.info("Extracting last user message")
        last_user_message = next((m for m in reversed(request.messages) if m.role == "user"), None)
        
        if not last_user_message:
            logging.warning("No user message found in request")
            raise HTTPException(status_code=400, detail="No user message found")
        
        # Check if the query is pet-related
        logging.info("Checking if query is pet-related")
        if not is_pet_related(last_user_message.content):
            logging.info("Query is not pet-related")
            return ChatResponse(
                text="I'm a pet assistant designed to help with pet-related questions. Could you please ask me something about pets, pet care, or animal behavior?"
            )
        
        # Prepare the prompt with context
        logging.info("Preparing prompt with context")
        prompt = "You are PawGuide, a helpful and friendly pet assistant. "
        
        # Add pet context if available
        if request.petContext:
            prompt += f"The user has a {request.petContext.type} named {request.petContext.name}. "
            
            if request.petContext.breed:
                prompt += f"Breed: {request.petContext.breed}. "
            
            if request.petContext.age:
                prompt += f"Age: {request.petContext.age}. "
            
            if request.petContext.notes:
                prompt += f"Additional information: {request.petContext.notes}. "
            
            prompt += "Please consider this information when providing advice. "
        
        prompt += "Provide helpful, accurate, and concise information about pet care, behavior, training, nutrition, or health. "
        prompt += "Format your response using markdown for better readability. Use headings, lists, and emphasis where appropriate. "
        prompt += "If you're unsure about something, acknowledge the limitations of your knowledge and suggest consulting a veterinarian or professional."
        
        # Prepare conversation history
        logging.info("Preparing conversation history")
        conversation = []
        for message in request.messages:
            role = "user" if message.role == "user" else "model"
            conversation.append({"role": role, "parts": [{"text": message.content}]})
        
        # Add system prompt
        logging.info("Adding system prompt")
        conversation.insert(0, {"role": "model", "parts": [{"text": prompt}]})
        
        try:
            # Generate response
            logging.info("Generating response from Gemini")
            chat = model.start_chat(history=conversation)
            response = chat.send_message(last_user_message.content)
            
            # Format the response with markdown
            logging.info("Formatting response with markdown")
            formatted_response = format_with_markdown(response.text)
            
            logging.info("Returning chat response")
            return ChatResponse(text=formatted_response)
        except Exception as e:
            logging.error(f"Error generating response from Gemini: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")
    except HTTPException as http_ex:
        # Re-raise HTTPExceptions to preserve their status code
        raise http_ex
    except Exception as e:
        logging.error(f"Unexpected error in /api/chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "PawGuide Pet Assistant API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

