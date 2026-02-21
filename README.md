# GPT-4o Chatbot (FastAPI + HTML/JS)

## Features
- FastAPI backend with Swagger (`/docs`).
- GPT-4o streaming chat response.
- 2 answering modes:
  - LLM native knowledge.
  - Web search + LLM (auto or manual toggle).
- Search providers: SerpAPI / DDGS.
- Upload files (`pdf/ppt/doc/xls/txt/png/jpg`) as additional context.
- Frontend markdown rendering, compact bullet-style output.
- UX for stable browsing: each QA block keeps question sticky on top.
- Enter to send; Shift+Enter for multiline input.

## Setup
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Set env vars:
```bash
export OPENAI_API_KEY=your_key
export SERPAPI_API_KEY=your_key  # required only for SerpAPI mode
```

Run:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Open:
- App: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
