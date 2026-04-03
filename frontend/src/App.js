import React, { useState, useCallback } from "react";
import Select from "react-select";
import ProjectCard from "./ProjectCard";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const SKILL_OPTIONS = [
  "Python", "JavaScript", "TypeScript", "React", "Node.js", "C++", "Java",
  "Go", "Rust", "Ruby", "Swift", "Kotlin", "SQL", "MongoDB", "PostgreSQL",
  "Docker", "Kubernetes", "AWS", "Flask", "FastAPI", "Django", "Express",
  "TensorFlow", "PyTorch", "scikit-learn", "OpenCV", "Pandas", "Solidity",
  "Web3.js", "HTML", "CSS", "Redis", "GraphQL", "Firebase",
].map((s) => ({ value: s, label: s }));

const INTEREST_OPTIONS = [
  "AI", "Machine Learning", "Web Development", "Blockchain", "Data Science",
  "DevOps", "Mobile Development", "Game Development", "IoT", "Security",
  "NLP", "Computer Vision", "Cloud Computing", "Automation", "Finance",
  "E-Commerce", "Education", "Health", "Robotics", "Developer Tools",
].map((s) => ({ value: s, label: s }));

const LEVEL_OPTIONS = [
  { value: "beginner",     label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced",     label: "Advanced" },
];

function App() {
  const [skills,         setSkills]         = useState([]);
  const [interests,      setInterests]      = useState([]);
  const [level,          setLevel]          = useState(null);
  const [results,        setResults]        = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [showBookmarks,  setShowBookmarks]  = useState(false);
  const [bookmarks,      setBookmarks]      = useState(() => {
    try { return JSON.parse(localStorage.getItem("bookmarks") || "[]"); }
    catch { return []; }
  });

  const toggleBookmark = useCallback((project) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.project_id === project.project_id);
      const next   = exists
        ? prev.filter((b) => b.project_id !== project.project_id)
        : [...prev, project];
      try { localStorage.setItem("bookmarks", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skills.length || !interests.length || !level) {
      setError("Please fill in all fields before getting recommendations.");
      return;
    }
    setError("");
    setLoading(true);
    setResults([]);
    setShowBookmarks(false);

    try {
      const res = await fetch(`${API_URL}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills:    skills.map((s) => s.value),
          interests: interests.map((i) => i.value),
          level:     level.value,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Server error: ${res.status}`);
      }
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const displayedProjects = showBookmarks ? bookmarks : results;
  const resultsLabel      = showBookmarks ? "Saved Projects" : "Recommended Projects";

  return (
    <div className="app">

      {/* ── Nav ── */}
      <nav className="nav">
        <div className="nav-logo">
          <span className="nav-logo-dot" />
          <span className="nav-logo-text">
            dev<span>.</span>recommender
          </span>
        </div>

        <button
          className={`nav-bookmark-btn${showBookmarks ? " active" : ""}`}
          onClick={() => setShowBookmarks((v) => !v)}
          aria-label="Toggle bookmarks"
        >
          {showBookmarks ? "← Back" : "★ Saved"}
          <span className="bookmark-count">{bookmarks.length}</span>
        </button>
      </nav>

      <main className="main">

        {/* ── Hero ── */}
        <header className="hero">
          <p className="hero-eyebrow">ML-powered · TF-IDF + cosine similarity</p>
          <h1 className="hero-heading">
            What should you<br />
            <em>build next?</em>
          </h1>
          <p className="hero-sub">
            Tell us your skills and interests — we'll surface the projects most worth your time.
          </p>
        </header>

        {/* ── Form ── */}
        <section className="form-panel">
          <form onSubmit={handleSubmit}>
            <div className="form-fields">

              <div className="form-field">
                <label htmlFor="skills-input">Skills</label>
                <Select
                  inputId="skills-input"
                  isMulti
                  options={SKILL_OPTIONS}
                  value={skills}
                  onChange={setSkills}
                  classNamePrefix="rs"
                  placeholder="e.g. Python, React, Docker…"
                  isClearable
                />
              </div>

              <div className="form-field">
                <label htmlFor="interests-input">Interests</label>
                <Select
                  inputId="interests-input"
                  isMulti
                  options={INTEREST_OPTIONS}
                  value={interests}
                  onChange={setInterests}
                  classNamePrefix="rs"
                  placeholder="e.g. Machine Learning, Web Dev…"
                  isClearable
                />
              </div>

              <div className="form-field">
                <label htmlFor="level-input">Experience Level</label>
                <Select
                  inputId="level-input"
                  options={LEVEL_OPTIONS}
                  value={level}
                  onChange={setLevel}
                  classNamePrefix="rs"
                  placeholder="Select your level…"
                  isSearchable={false}
                />
              </div>
            </div>

            {error && (
              <div className="error-msg" role="alert">⚠ {error}</div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading
                  ? <><span className="spinner" /> Analyzing profile…</>
                  : "Get Recommendations →"
                }
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowBookmarks((v) => !v)}
              >
                {showBookmarks ? "← Results" : "★ Saved"}
                <span className="badge-count">{bookmarks.length}</span>
              </button>
            </div>
          </form>
        </section>

        {/* ── Loader ── */}
        {loading && (
          <div className="loader-wrap" aria-live="polite">
            <div className="loader" />
            <p>Analyzing your profile…</p>
          </div>
        )}

        {/* ── Results / Bookmarks ── */}
        {!loading && displayedProjects.length > 0 && (
          <section className="results" aria-live="polite">
            <div className="results-header">
              <h2>{resultsLabel}</h2>
              <span className="results-count">{displayedProjects.length} found</span>
              <div className="results-divider" />
            </div>

            <div className="cards-grid">
              {displayedProjects.map((project) => (
                <ProjectCard
                  key={project.project_id}
                  project={project}
                  isBookmarked={bookmarks.some((b) => b.project_id === project.project_id)}
                  onToggleBookmark={() => toggleBookmark(project)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Empty state ── */}
        {!loading && displayedProjects.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-state-glyph">◎</div>
            <p>
              {showBookmarks
                ? "No saved projects yet. Star a card to save it here."
                : "Fill in your details above and hit Get Recommendations."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
