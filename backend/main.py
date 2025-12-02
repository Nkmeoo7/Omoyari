from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, select, Session
from sqlalchemy import text
from database import engine, get_session
from models import JournalEntry
import requests
import json

app = FastAPI()

#cors handling
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Create Tables on Startup
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

# --- HELPER FUNCTIONS (OLLAMA) ---

def get_embedding(text: str):
    """Turns text into numbers using nomic-embed-text"""
    try:
        res = requests.post('http://localhost:11434/api/embeddings', 
                            json={"model": "nomic-embed-text", "prompt": text})
        return res.json()["embedding"]
    except Exception as e:
        print(f"Embedding Error: {e}")
        return [0.0] * 768 # Return empty vector on failure

def get_ai_perspectives(text: str, context: str):
    """Generates 3 personas using Llama 3.2"""
    prompt = f"""
    User Entry: "{text}"
    Past Context: "{context}"
    
    Act as a 'Board of Directors' for mental health. Provide 3 short responses (max 20 words each) in JSON format:
    1. 'stoic': Logical, focuses on control.
    2. 'coach': Tough love, action-oriented.
    3. 'friend': Empathetic, validating.
    
    Return ONLY JSON. Example: {{ "stoic": "...", "coach": "...", "friend": "..." }}
    """
    try:
        res = requests.post('http://localhost:11434/api/generate', 
                            json={"model": "llama3.2", "prompt": prompt, "format": "json", "stream": False})
        return json.loads(res.json()['response'])
    except Exception as e:
        print(f"Generation Error: {e}")
        return {"stoic": "AI Offline", "coach": "AI Offline", "friend": "AI Offline"}

# --- ROUTES ---

@app.post("/entries")
def create_entry(entry_text: str, session: Session = Depends(get_session)):
    # 1. Vectorize
    vector = get_embedding(entry_text)
    
    # 2. RAG Search (Find 2 most similar past entries)
    # The <-> operator calculates distance. Lower is better.
    statement = text("SELECT content FROM journalentry ORDER BY embedding <-> :v LIMIT 2")
    results = session.execute(statement, {"v": str(vector)}).fetchall()
    context_str = "\n".join([row[0] for row in results])
    
    # 3. Generate Advice with Context
    perspectives = get_ai_perspectives(entry_text, context_str)
    
    # 4. Save
    new_entry = JournalEntry(
        content=entry_text,
        emotion="neutral", # Placeholder, or add emotion classifier here
        embedding=vector,
        perspectives=perspectives
    )
    session.add(new_entry)
    session.commit()
    session.refresh(new_entry)
    
    #vector from 
    import numpy as np
    if isinstance(new_entry.embedding, np.ndarray):
        new_entry.embedding = new_entry.embedding.tolist()

    return new_entry

@app.get("/entries")
def get_entries(session: Session = Depends(get_session)):
    return session.exec(select(JournalEntry).order_by(JournalEntry.created_at.desc())).all()
