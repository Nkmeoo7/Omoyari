from sqlmodel import SQLModel, Field
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, JSON
from typing import List, Optional, Dict
from datetime import datetime

class JournalEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    emotion: str
    
    # Stores the "Board of Directors" advice (JSON)
    perspectives: Dict = Field(default={}, sa_column=Column(JSON))
    
    # Stores the Vector Embedding
    # MAKE SURE THIS LINE ALIGNS WITH THE LINES ABOVE IT
    embedding: List[float] = Field(sa_column=Column(Vector(768)))
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
