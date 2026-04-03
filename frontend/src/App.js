import React, { useState, useCallback, useRef } from "react";
import Select from "react-select";
import ProjectCard from "./ProjectCard";
import WhatIfPanel from "./WhatIfPanel";
import DecideMode from "./DecideMode";
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

async function fetchRecommendations(skills, interests, level) {
  const res = await fetch(`${API_URL}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skills, interests, level }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || `Server error: ${res.status}`);
  }
  return res.json();
}

function getUnlockedIds(before, after) {
  const beforeIds = new Set(before.map(p => p.project_id));
  return new Set(after.filter(p => !beforeIds.has(p.project_id)).map(p => p.project_id));
}

export default function App() {
  const [skills,        setSkills]        = useState([]);
  const [interests,     setInterests]     = useState([]);
  const [level,         setLevel]         = useState(null);
  const [hypotheticals, setHypotheticals] = useState([]);
  const [baseResults,   setBaseResults]   = useState([]);
  const [whatIfResults, setWhatIfResults] = useState([]);
  const [unlockedIds,   setUnlockedIds]   = useState(new Set());
  const [hasSearched,   setHasSearched]   = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [mode,          setMode]          = useState("explore");
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarks,     setBookmarks]     = useState(() => {
    try { return JSON.parse(localStorage.getItem("bookmarks") || "[]"); } catch { return []; }
  });

  const resultsRef = useRef(null);

  const toggleBookmark = useCallback((project) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.project_id === project.project_id);
      const next   = exists
        ? prev.filter(b => b.project_id !== project.project_id)
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
    setHasSearched(false);
    setShowBookmarks(false);

    try {
      const skillValues    = skills.map(s => s.value);
      const interestValues = interests.map(i => i.value);
      const levelValue     = level.value;

      const basePromise = fetchRecommendations(skillValues, interestValues, levelValue);
      const whatIfPromise = hypotheticals.length > 0
        ? fetchRecommendations([...skillValues, ...hypotheticals], interestValues, levelValue)
        : Promise.resolve(null);

      const [base, whatIf] = await Promise.all([basePromise, whatIfPromise]);

      setBaseResults(base || []);
      setWhatIfResults(whatIf || []);
      setUnlockedIds(whatIf ? getUnlockedIds(base, whatIf) : new Set());
      setHasSearched(true);

      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showDiff = hasSearched && hypotheticals.length > 0 && whatIfResults.length > 0;

  return (
    <div className="app">

      {/* ── Nav ── */}
      <nav className="nav">
        <div className="nav-logo">
          <span className="nav-logo-dot" />
          <span className="nav-logo-text">dev<span>.</span>recommender</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {hasSearched && (
            <div className="mode-toggle">
              <button
                className={`mode-btn${mode === "explore" ? " mode-active" : ""}`}
                onClick={() => { setMode("explore"); setShowBookmarks(false); }}
              >
                Explore
              </button>
              <button
                className={`mode-btn${mode === "decide" ? " mode-active" : ""}`}
                onClick={() => { setMode("decide"); setShowBookmarks(false); }}
              >
                Decide
              </button>
            </div>
          )}
          <button
            className={`nav-bookmark-btn${showBookmarks ? " active" : ""}`}
            onClick={() => { setShowBookmarks(v => !v); setMode("explore"); }}
          >
            {showBookmarks ? "← Back" : "★ Saved"}
            <span className="bookmark-count">{bookmarks.length}</span>
          </button>
        </div>
      </nav>

      <main className="main">

        {/* ── Hero ── */}
        <header className="hero">
          <p className="hero-eyebrow">ML-powered · TF-IDF + cosine similarity</p>
          <h1 className="hero-heading">
            What should you<br /><em>build next?</em>
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
                <Select inputId="skills-input" isMulti options={SKILL_OPTIONS}
                  value={skills} onChange={setSkills} classNamePrefix="rs"
                  placeholder="e.g. Python, React, Docker…" isClearable />
              </div>
              <div className="form-field">
                <label htmlFor="interests-input">Interests</label>
                <Select inputId="interests-input" isMulti options={INTEREST_OPTIONS}
                  value={interests} onChange={setInterests} classNamePrefix="rs"
                  placeholder="e.g. Machine Learning, Web Dev…" isClearable />
              </div>
              <div className="form-field">
                <label htmlFor="level-input">Experience Level</label>
                <Select inputId="level-input" options={LEVEL_OPTIONS}
                  value={level} onChange={setLevel} classNamePrefix="rs"
                  placeholder="Select your level…" isSearchable={false} />
              </div>
              <WhatIfPanel
                realSkills={skills.map(s => s.value)}
                hypotheticals={hypotheticals}
                onChange={setHypotheticals}
                loading={loading}
              />
            </div>

            {error && <div className="error-msg" role="alert">⚠ {error}</div>}

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading
                  ? <><span className="spinner" /> Analyzing{hypotheticals.length > 0 ? " both scenarios" : ""}…</>
                  : hypotheticals.length > 0 ? "Compare Scenarios →" : "Get Recommendations →"
                }
              </button>
              <button type="button" className="btn-secondary"
                onClick={() => { setShowBookmarks(v => !v); setMode("explore"); }}>
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
            <p>{hypotheticals.length > 0 ? "Running both scenarios…" : "Analyzing your profile…"}</p>
          </div>
        )}

        {/* ── Results area ── */}
        {!loading && (
          <div ref={resultsRef}>

            {/* DECIDE MODE */}
            {mode === "decide" && !showBookmarks && (
              <DecideMode results={baseResults} onSwitchExplore={() => setMode("explore")} />
            )}

            {/* EXPLORE MODE */}
            {mode === "explore" && (
              <>
                {/* Bookmarks */}
                {showBookmarks && (
                  <section className="results">
                    <div className="results-header">
                      <h2>Saved Projects</h2>
                      <span className="results-count">{bookmarks.length} saved</span>
                      <div className="results-divider" />
                    </div>
                    {bookmarks.length > 0 ? (
                      <div className="cards-grid">
                        {bookmarks.map(p => (
                          <ProjectCard key={p.project_id} project={p}
                            isBookmarked={true} onToggleBookmark={() => toggleBookmark(p)} />
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <div className="empty-state-glyph">◎</div>
                        <p>No saved projects yet. Star a card to save it here.</p>
                      </div>
                    )}
                  </section>
                )}

                {/* DIFF VIEW */}
                {!showBookmarks && showDiff && (
                  <section className="results" style={{ animation: "fade-up 0.38s ease both" }}>
                    <div className="results-header" style={{ marginBottom: 16 }}>
                      <h2>Scenario Comparison</h2>
                      <span className="results-count">+{unlockedIds.size} unlocked</span>
                      <div className="results-divider" />
                    </div>

                    {/* hypothetical skill pills */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                      <span style={{
                        fontFamily: "var(--mono)", fontSize: "0.64rem",
                        color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase",
                      }}>Hypothetical:</span>
                      {hypotheticals.map(s => (
                        <span key={s} style={{
                          fontFamily: "var(--mono)", fontSize: "0.67rem", fontWeight: 500,
                          padding: "2px 8px", borderRadius: "var(--radius-sm)",
                          border: "1.5px dashed var(--accent-cyan)",
                          color: "var(--accent-cyan)", background: "rgba(0,217,255,0.05)",
                        }}>+ {s}</span>
                      ))}
                    </div>

                    {/* two columns */}
                    <div className="diff-columns">
                      <div className="diff-col">
                        <div className="diff-col-header diff-col-header--base">
                          <span className="diff-col-label">Without</span>
                          <span className="diff-col-sub">Your current skills</span>
                        </div>
                        <div className="cards-grid">
                          {baseResults.map(p => (
                            <ProjectCard key={p.project_id} project={p}
                              isBookmarked={bookmarks.some(b => b.project_id === p.project_id)}
                              onToggleBookmark={() => toggleBookmark(p)} />
                          ))}
                        </div>
                      </div>

                      <div className="diff-col">
                        <div className="diff-col-header diff-col-header--whatif">
                          <span className="diff-col-label">With +{hypotheticals.join(", +")}</span>
                          <span className="diff-col-sub">
                            {unlockedIds.size > 0
                              ? `${unlockedIds.size} new project${unlockedIds.size > 1 ? "s" : ""} unlocked`
                              : "Same results — try different skills"}
                          </span>
                        </div>
                        <div className="cards-grid">
                          {whatIfResults.map(p => (
                            <ProjectCard key={p.project_id} project={p}
                              isBookmarked={bookmarks.some(b => b.project_id === p.project_id)}
                              onToggleBookmark={() => toggleBookmark(p)}
                              isUnlocked={unlockedIds.has(p.project_id)} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* NORMAL RESULTS */}
                {!showBookmarks && !showDiff && hasSearched && (
                  <section className="results">
                    <div className="results-header">
                      <h2>Recommended Projects</h2>
                      <span className="results-count">{baseResults.length} found</span>
                      <div className="results-divider" />
                    </div>
                    {baseResults.length > 0 ? (
                      <div className="cards-grid">
                        {baseResults.map(p => (
                          <ProjectCard key={p.project_id} project={p}
                            isBookmarked={bookmarks.some(b => b.project_id === p.project_id)}
                            onToggleBookmark={() => toggleBookmark(p)} />
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <div className="empty-state-glyph">◎</div>
                        <p>No matches found. Try broadening your skills or switching experience level.</p>
                      </div>
                    )}
                  </section>
                )}

                {/* Initial empty */}
                {!showBookmarks && !hasSearched && !loading && (
                  <div className="empty-state">
                    <div className="empty-state-glyph">◎</div>
                    <p>Fill in your profile above and hit Get Recommendations.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
