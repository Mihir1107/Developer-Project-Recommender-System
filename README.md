# dev.recommender

> A full-stack ML application that recommends software project ideas based on your skills, interests, and experience level — using content-based filtering powered by TF-IDF and cosine similarity.

---

## Tech Stack

- **Backend:** FastAPI (Python) · scikit-learn (TF-IDF + Cosine Similarity)
- **Frontend:** React · react-select · CSS custom properties
- **Data:** CSV dataset with 55 curated project entries

---

## How It Works

1. User inputs skills, interests, and experience level
2. Text fields (`description` + `tags` + `tech_stack`) are vectorized using TF-IDF
3. Cosine similarity is computed between user query and project corpus
4. Hybrid scoring: `final_score = 0.7 × similarity + 0.3 × popularity_score`
5. Results are filtered by difficulty level and ranked by score
6. Each recommendation includes an explanation and skill gap analysis

---

## Project Structure

```
├── backend/
│   ├── main.py            # FastAPI app with endpoints
│   ├── recommender.py     # ML recommender engine
│   ├── requirements.txt   # Python dependencies
│   └── venv/              # Virtual environment
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Main app component + mode logic
│   │   ├── App.css        # Design system styles
│   │   ├── ProjectCard.js # Project card component
│   │   ├── WhatIfPanel.js # What-If skill simulator
│   │   ├── DecideMode.js  # Top 3 decision view
│   │   ├── index.js       # Entry point
│   │   └── index.css      # Global CSS variables + reset
│   └── package.json
├── data/
│   └── projects.csv       # Dataset (55 projects)
└── README.md
```

---

## Setup & Run

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`  
Swagger docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`

---

## API Endpoints

### `POST /recommend`

```json
{
  "skills": ["Python", "ML"],
  "interests": ["AI"],
  "level": "beginner"
}
```

Returns top 5 projects with name, description, tech stack, difficulty, recommendation reason, and missing skills.

### `POST /next-projects`

```json
{
  "completed_project_id": 1,
  "level": "intermediate"
}
```

Returns 3 progression project suggestions.

### `GET /health`

Returns system status and loaded project count.

---

## Features

### Core
- Explainable recommendations with per-project reasoning
- Difficulty-based filtering — beginners won't see advanced projects
- Skill gap detection — shows exactly what you'd need to learn
- Bookmark / save projects (persisted in `localStorage`)
- Responsive design with dark theme and smooth transitions

### Explore Mode
- Full results list with staggered card animations
- **What-If Simulator** — add hypothetical skills you don't have yet; fires two API calls simultaneously and renders results side-by-side showing which projects get unlocked
- Unlocked cards are visually distinguished with a `✦ Unlocked` label and cyan glow

### Decide Mode
- Strips results down to top 3 picks
- Single strongest reason surfaced per project
- Side-by-side comparison layout
- "Commit to this →" button with visual confirmation state

---

## Deployment

### Backend (Render)

1. Push backend code to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)

1. Push frontend code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set environment variable: `REACT_APP_API_URL=<your Render backend URL>`
4. Deploy

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_URL` | `http://localhost:8000` | Backend API base URL |

---

```
 ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·

          built by two people who think side projects
               deserve better recommendation engines

  ╔══════════════════════╗       ╔═══════════════════════╗
  ║   mihir mandavia     ║  ──   ║     haya sachin        ║
  ║   backend · ML       ║       ║   frontend · design    ║
  ╚══════════════════════╝       ╚═══════════════════════╝

 ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
```
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

### Core
- Explainable recommendations with reasoning
- Difficulty-based filtering (beginners won't see advanced projects)
- Skill gap detection (shows what you need to learn)
- Bookmark/save projects (persisted in localStorage)
- Responsive design with dark theme
- Loading animations and smooth transitions

### What-If Skill Simulator
Add hypothetical skills you don't have yet and instantly compare two scenarios side by side — your current profile vs. your hypothetical one. Projects unlocked exclusively by the new skill are highlighted with a ✦ **Unlocked** badge and a distinct cyan glow, making the learning value of any skill immediately visible.

### Explore / Decide Modes
Two distinct interaction modes accessible via a nav toggle (appears after the first search):

- **Explore mode** — full ranked results list with the What-If simulator for open-ended browsing
- **Decide mode** — narrows to the top 3 picks shown side by side, each with a single strongest reason and a "Commit to this →" CTA to reduce decision fatigue

## UI Design

The frontend uses a **Terminal Craft** design system — a developer-native dark theme with a cyan/violet accent palette, JetBrains Mono for labels and tags, and Inter for body text. Key design tokens are defined as CSS variables in `index.css` for full consistency across components.

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


## Created By Mihir Mandavia & Haya Sachin
