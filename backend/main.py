"""
FastAPI backend for the Developer Project Recommender System.
"""

from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from recommender import ProjectRecommender

app = FastAPI(
    title="Developer Project Recommender",
    description="Recommends software projects based on skills, interests, and experience level.",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load recommender engine once at startup
DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "projects.csv"
recommender = ProjectRecommender(str(DATA_PATH))


# --- Request / Response models ---

class RecommendRequest(BaseModel):
    skills: list[str] = Field(..., min_length=1, examples=[["Python", "ML"]])
    interests: list[str] = Field(..., min_length=1, examples=[["AI"]])
    level: str = Field(..., pattern="^(beginner|intermediate|advanced)$", examples=["beginner"])


class ProjectResponse(BaseModel):
    project_id: int
    project_name: str
    description: str
    tech_stack: list[str]
    difficulty: str
    github_link: str
    score: float
    reason: str
    missing_skills: list[str]


class NextProjectRequest(BaseModel):
    completed_project_id: int
    level: str = Field(..., pattern="^(beginner|intermediate|advanced)$")


class NextProjectResponse(BaseModel):
    project_id: int
    project_name: str
    description: str
    difficulty: str
    tech_stack: list[str]


# --- Endpoints ---

@app.post("/recommend", response_model=list[ProjectResponse])
def recommend_projects(req: RecommendRequest):
    """Return top 5 project recommendations based on user profile."""
    results = recommender.recommend(
        skills=req.skills,
        interests=req.interests,
        level=req.level,
    )
    if not results:
        raise HTTPException(status_code=404, detail="No matching projects found.")
    return results


@app.post("/next-projects", response_model=list[NextProjectResponse])
def next_projects(req: NextProjectRequest):
    """Suggest what to build next after completing a project."""
    results = recommender.get_next_projects(
        completed_id=req.completed_project_id,
        level=req.level,
    )
    if not results:
        raise HTTPException(status_code=404, detail="No progression projects found.")
    return results


@app.get("/health")
def health():
    return {"status": "ok", "projects_loaded": len(recommender.df)}
