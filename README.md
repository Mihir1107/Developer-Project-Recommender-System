# Developer Project Recommender System

A full-stack application that recommends software project ideas based on your skills, interests, and experience level using ML-powered content-based filtering.

## Tech Stack

- **Backend:** FastAPI (Python) with scikit-learn (TF-IDF + Cosine Similarity)
- **Frontend:** React with react-select
- **Data:** CSV dataset with 55 curated project entries

## How It Works

1. User inputs skills, interests, and experience level
2. Text fields (description + tags + tech_stack) are vectorized using TF-IDF
3. Cosine similarity is computed between user query and project corpus
4. Hybrid scoring: `final_score = 0.7 * similarity + 0.3 * popularity_score`
5. Results are filtered by difficulty level and ranked by score
6. Each recommendation includes an explanation and skill gap analysis

## Project Structure

```
├── backend/
│   ├── main.py            # FastAPI app with endpoints
│   ├── recommender.py     # ML recommender engine
│   ├── requirements.txt   # Python dependencies
│   └── venv/              # Virtual environment
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main app component
│   │   ├── App.css        # Styles
│   │   ├── ProjectCard.js # Project card component
│   │   ├── index.js       # Entry point
│   │   └── index.css      # Global styles
│   └── package.json
├── data/
│   └── projects.csv       # Dataset (55 projects)
└── README.md
```

## Setup & Run

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`.

## API Endpoints

### POST /recommend
```json
{
  "skills": ["Python", "ML"],
  "interests": ["AI"],
  "level": "beginner"
}
```

Returns top 5 projects with name, description, tech stack, difficulty, recommendation reason, and missing skills.

### POST /next-projects
```json
{
  "completed_project_id": 1,
  "level": "intermediate"
}
```

Returns 3 progression project suggestions.

### GET /health
Returns system status and loaded project count.

## Features

- Explainable recommendations with reasoning
- Difficulty-based filtering (beginners won't see advanced projects)
- Skill gap detection (shows what you need to learn)
- Bookmark/save projects (persisted in localStorage)
- Project progression suggestions
- Responsive design with dark theme
- Loading animations and smooth transitions

## Deployment

### Backend (Render)
1. Push backend code to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)
1. Push frontend code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set `REACT_APP_API_URL` environment variable to your Render backend URL
4. Deploy
