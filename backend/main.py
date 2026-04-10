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
    free_query: str = Field(default="", examples=["something with real-time data"])
    liked_ids: list[int] = Field(default=[], examples=[[1, 3]])
    excluded_ids: list[int] = Field(default=[], examples=[[2]])


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
    confidence: str


class NextProjectRequest(BaseModel):
    completed_project_id: int
    level: str = Field(..., pattern="^(beginner|intermediate|advanced)$")


class NextProjectResponse(BaseModel):
    project_id: int
    project_name: str
    description: str
    difficulty: str
    tech_stack: list[str]


class SimilarProjectResponse(BaseModel):
    project_id: int
    project_name: str
    description: str
    difficulty: str
    tech_stack: list[str]
    github_link: str
    score: float


# --- Endpoints ---

@app.post("/recommend", response_model=list[ProjectResponse])
def recommend_projects(req: RecommendRequest):
    """Return top 5 project recommendations based on user profile."""
    results = recommender.recommend(
        skills=req.skills,
        interests=req.interests,
        level=req.level,
        free_query=req.free_query,
        liked_ids=req.liked_ids or None,
        excluded_ids=req.excluded_ids or None,
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


@app.get("/skills")
def get_skills():
    """Return all unique skills extracted from project tech stacks."""
    return recommender.get_all_skills()


@app.get("/interests")
def get_interests():
    """Return all unique interests extracted from project tags."""
    return recommender.get_all_interests()


@app.get("/similar/{project_id}", response_model=list[SimilarProjectResponse])
def similar_projects(project_id: int):
    """Return the most similar projects to a given project by TF-IDF cosine similarity."""
    results = recommender.get_similar(project_id)
    if not results:
        raise HTTPException(status_code=404, detail="Project not found or no similar projects.")
    return results


@app.get("/health")
def health():
    return {"status": "ok", "projects_loaded": len(recommender.df)}
