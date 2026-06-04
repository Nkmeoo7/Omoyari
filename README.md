# Omoyari 

Omoyari is an AI-powered mental health journaling application. It allows users to write journal entries and leverages large language models (LLMs) and Retrieval-Augmented Generation (RAG) to provide contextual, persona-based advice. By understanding past entries, the AI responds as a "Board of Directors" for your mental health—offering perspectives from a Stoic, a Coach, and a Friend.

## Architecture

```mermaid
graph TD
    Client[Frontend: Next.js + React] -->|REST API / JSON| API[Backend: FastAPI]
    API -->|Read/Write Vectors & Text| DB[(PostgreSQL + pgvector)]
    API -->|Generate Embeddings| Embed[Ollama: nomic-embed-text]
    API -->|RAG: Context + Prompt| Generate[Ollama: llama3.2]
    
    subgraph Local AI
        Embed
        Generate
    end
```

## Technologies Used

**Frontend**
- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Framer Motion (Animations)
- Lucide React (Icons)

**Backend**
- Python 3
- FastAPI
- SQLModel / SQLAlchemy
- PostgreSQL (with `pgvector` extension for similarity search)

**AI & Machine Learning (Local)**
- Ollama
- `nomic-embed-text` (For generating text embeddings)
- `llama3.2` (For generating persona-based advice)

## Local Setup

### Prerequisites

1. **Node.js** (v20+)
2. **Python** (3.9+)
3. **PostgreSQL** database with the `pgvector` extension installed. (You can use Neon, Supabase, or a local instance).
4. **Ollama** installed and running on your machine.

### 1. Set up Local AI Models

Ensure Ollama is running locally, then open your terminal and pull the required models:

```bash
ollama pull nomic-embed-text
ollama pull llama3.2
```

### 2. Backend Setup

Open a terminal and navigate to the `backend` directory:

```bash
cd backend
```

Create a virtual environment and install the dependencies:

```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
```

Set up your environment variables. Create a `.env` file in the `backend` directory with your database connection string:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/omoyari" # Replace with your pgvector DB URL
```

Start the FastAPI server. The database tables will be created automatically on startup.

```bash
uvicorn main:app --reload
```

The backend API will be available at `http://localhost:8000`.

### 3. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend
```

Install the required node modules:

```bash
npm install
```

Start the Next.js development server:

```bash
npm run dev
```

The web application will be accessible at `http://localhost:3000`.
