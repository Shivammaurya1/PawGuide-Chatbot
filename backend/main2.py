from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import google.generativeai as genai
import os
import re
from dotenv import load_dotenv

load_dotenv()
app = FastAPI(title="PawGuide API", description="Backend for PawGuide Pet Assistant")

# Configure CORS to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-pro')

# Define request and response models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

# Pet-related keywords for filtering
PET_KEYWORDS = [
    'pet', 'dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'guinea pig', 'turtle',
    'reptile', 'parrot', 'canary', 'goldfish', 'puppy', 'kitten', 'animal', 'veterinarian',
    'vet', 'feed', 'food', 'treat', 'toy', 'leash', 'collar', 'cage', 'tank', 'aquarium',
    'terrarium', 'breed', 'training', 'behavior', 'groom', 'walk', 'health', 'medicine',
    'vaccination', 'flea', 'tick', 'parasite', 'adoption', 'rescue', 'shelter', 'neuter',
    'spay', 'litter', 'bedding', 'habitat', 'fur', 'feather', 'scale', 'paw', 'claw',
    'beak', 'tail', 'wing', 'fin', 'bark', 'meow', 'chirp', 'lizard', 'snake', 'ferret',
    'gerbil', 'mouse', 'rat', 'chinchilla', 'hedgehog', 'horse', 'pony', 'goat', 'sheep',
    'chicken', 'duck', 'goose', 'cow', 'pig', 'farm animal'
]

def is_pet_related(query: str) -> bool:
    """Check if the query is related to pets using keyword matching and regex."""
    query = query.lower()
    
    # Direct keyword matching
    for keyword in PET_KEYWORDS:
        if keyword in query:
            return True
    
    # Use regex for more flexible matching (e.g., plurals, possessives)
    pet_pattern = r'\b(pet|animal|dog|cat|bird|fish)s?\b|\b(veterinar(y|ian)|vet)\b'
    if re.search(pet_pattern, query):
        return True
    
    return False

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Extract the latest user message
        user_messages = [msg for msg in request.messages if msg.role == "user"]
        if not user_messages:
            raise HTTPException(status_code=400, detail="No user message found")
        
        latest_user_message = user_messages[-1].content
        
        # Check if the query is pet-related
        if not is_pet_related(latest_user_message):
            return {
                "text": "I'm sorry, I can only answer questions related to pets and animals. Please ask me something about pet care, behavior, training, or other pet-related topics."
            }
        
        # Format messages for Gemini
        formatted_messages = []
        for msg in request.messages:
            role = "user" if msg.role == "user" else "model"
            formatted_messages.append({"role": role, "parts": [msg.content]})
        
        # Add system prompt to guide the model
        system_prompt = {
            "role": "system", 
            "parts": ["You are PawGuide, a friendly and knowledgeable pet assistant. You provide helpful, accurate information about pet care, behavior, training, nutrition, and health. You're conversational, empathetic, and always focus on the well  training, nutrition, and health. You're conversational, empathetic, and always focus on the wellbeing of pets. If you don't know something or if it's a medical emergency, you advise consulting a veterinarian. Only answer questions related to pets and animals."]
        }
        
        # Generate response from Gemini
        chat = model.start_chat(history=formatted_messages)
        response = chat.send_message(system_prompt["parts"][0] + "\n\nUser query: " + latest_user_message)
        
        return {"text": response.text}
    
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"status": "PawGuide API is running", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)