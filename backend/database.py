from sqlalchemy.orm import Session
from sqlmodel import create_engine,Session,SQLModel
import os
from dotenv import load_dotenv

load_dotenv();

database_url = os.getenv("DATABASE_URL")

if database_url is None:
    raise ValueError("database_url is empty from .env file")


engine = create_engine(database_url);


def get_session():
    with Session(engine) as session:
        yield session
