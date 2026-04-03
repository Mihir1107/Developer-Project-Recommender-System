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
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

// Custom styles for react-select to match our dark theme
const selectStyles = {
  control: (base) => ({
    ...base,
    background: "#1e293b",
    borderColor: "#334155",
    borderRadius: 10,
    minHeight: 44,
    boxShadow: "none",
    "&:hover": { borderColor: "#6366f1" },
  }),
  menu: (base) => ({
    ...base,
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 10,
  }),
  option: (base, state) => ({
    ...base,
    background: state.isFocused ? "#334155" : "transparent",
    color: "#e2e8f0",
    cursor: "pointer",
  }),
  multiValue: (base) => ({
    ...base,
    background: "#6366f1",
    borderRadius: 6,
  }),
  multiValueLabel: (base) => ({ ...base, color: "#fff", fontWeight: 500 }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#c7d2fe",
    "&:hover": { background: "#4f46e5", color: "#fff" },
  }),
  singleValue: (base) => ({ ...base, color: "#e2e8f0" }),
  placeholder: (base) => ({ ...base, color: "#64748b" }),
  input: (base) => ({ ...base, color: "#e2e8f0" }),
};

function App() {
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [level, setLevel] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem("bookmarks");
    return saved ? JSON.parse(saved) : [];
  });
  const [showBookmarks, setShowBookmarks] = useState(false);

  const toggleBookmark = useCallback(
    (project) => {
      setBookmarks((prev) => {
        const exists = prev.some((b) => b.project_id === project.project_id);
        const next = exists
          ? prev.filter((b) => b.project_id !== project.project_id)
          : [...prev, project];
        localStorage.setItem("bookmarks", JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skills.length || !interests.length || !level) {
      setError("Please fill in all fields.");
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
          skills: skills.map((s) => s.value),
          interests: interests.map((i) => i.value),
          level: level.value,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to fetch recommendations.");
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

  return (
    <div className="app">
      <header className="header">
        <h1>Developer Project Recommender</h1>
        <p>Discover your next project based on your skills and interests</p>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Skills</label>
          <Select
            isMulti
            options={SKILL_OPTIONS}
            value={skills}
            onChange={setSkills}
            styles={selectStyles}
            placeholder="Select your skills..."
          />
        </div>

        <div className="form-group">
          <label>Interests</label>
          <Select
            isMulti
            options={INTEREST_OPTIONS}
            value={interests}
            onChange={setInterests}
            styles={selectStyles}
            placeholder="Select your interests..."
          />
        </div>

        <div className="form-group">
          <label>Experience Level</label>
          <Select
            options={LEVEL_OPTIONS}
            value={level}
            onChange={setLevel}
            styles={selectStyles}
            placeholder="Select your level..."
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Finding projects..." : "Get Recommendations"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowBookmarks((v) => !v)}
          >
            {showBookmarks ? "Hide Bookmarks" : `Bookmarks (${bookmarks.length})`}
          </button>
        </div>
      </form>

      {error && <div className="error-msg">{error}</div>}

      {loading && (
        <div className="loader-wrap">
          <div className="loader" />
          <p>Analyzing your profile...</p>
        </div>
      )}

      {displayedProjects.length > 0 && (
        <section className="results">
          <h2>{showBookmarks ? "Saved Projects" : "Recommended Projects"}</h2>
          <div className="cards-grid">
            {displayedProjects.map((project) => (
              <ProjectCard
                key={project.project_id}
                project={project}
                isBookmarked={bookmarks.some(
                  (b) => b.project_id === project.project_id
                )}
                onToggleBookmark={() => toggleBookmark(project)}
              />
            ))}
          </div>
        </section>
      )}

      {!loading && results.length === 0 && !showBookmarks && !error && (
        <div className="empty-state">
          <p>Fill in your details above and click "Get Recommendations" to discover projects.</p>
        </div>
      )}
    </div>
  );
}

export default App;
