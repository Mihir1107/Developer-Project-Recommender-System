import React, { useState, useCallback, useRef, useEffect } from "react";
import Select from "react-select";
import ProjectCard from "./ProjectCard";
import WhatIfPanel from "./WhatIfPanel";
import DecideMode from "./DecideMode";
import SimilarModal from "./SimilarModal";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Fallback lists used until the backend responds
const FALLBACK_SKILLS = [
  "Python", "JavaScript", "TypeScript", "React", "Node.js", "C++", "Java",
  "Go", "Rust", "Ruby", "Swift", "Kotlin", "SQL", "MongoDB", "PostgreSQL",
  "Docker", "Kubernetes", "AWS", "Flask", "FastAPI", "Django", "Express",
  "TensorFlow", "PyTorch", "scikit-learn", "OpenCV", "Pandas", "Solidity",
  "Web3.js", "HTML", "CSS", "Redis", "GraphQL", "Firebase",
];

const FALLBACK_INTERESTS = [
  "AI", "Machine Learning", "Web Development", "Blockchain", "Data Science",
  "DevOps", "Mobile Development", "Game Development", "IoT", "Security",
  "NLP", "Computer Vision", "Cloud Computing", "Automation", "Finance",
  "E-Commerce", "Education", "Health", "Robotics", "Developer Tools",
];

const LEVEL_OPTIONS = [
  { value: "beginner",     label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced",     label: "Advanced" },
];

function toOptions(arr) {
  return arr.map(s => ({ value: s, label: s }));
}

async function fetchRecommendations(skills, interests, level, opts = {}) {
  const res = await fetch(`${API_URL}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skills,
      interests,
      level,
      free_query:   opts.freeQuery    || "",
      liked_ids:    opts.likedIds     || [],
      excluded_ids: opts.excludedIds  || [],
    }),
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

export default function App({ onGoBack }) {
  const [skills,        setSkills]        = useState([]);
  const [interests,     setInterests]     = useState([]);
  const [level,         setLevel]         = useState(null);
  const [hypotheticals, setHypotheticals] = useState([]);
  const [baseResults,   setBaseResults]   = useState([]);
  const [whatIfResults, setWhatIfResults] = useState([]);
  const [unlockedIds,   setUnlockedIds]   = useState(new Set());
  const [hasSearched,   setHasSearched]   = useState(false);
  const [hasFired,      setHasFired]      = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [mode,          setMode]          = useState("explore");
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarks,     setBookmarks]     = useState(() => {
    try { return JSON.parse(localStorage.getItem("bookmarks") || "[]"); } catch { return []; }
  });

  // Skill / interest options — fetched from backend, fallback to hardcoded
  const [skillOptions,    setSkillOptions]    = useState(() => toOptions(FALLBACK_SKILLS));
  const [interestOptions, setInterestOptions] = useState(() => toOptions(FALLBACK_INTERESTS));

  // Free-text query
  const [freeQuery, setFreeQuery] = useState("");

  // Per-card feedback: { [project_id]: "too_easy" | "too_hard" | null }
  const [cardFeedback, setCardFeedback] = useState({});

  // Similar-projects modal state
  const [similarModal, setSimilarModal] = useState({
    open: false, sourceName: "", results: [], loading: false,
  });

  const resultsRef = useRef(null);

  // Fetch dynamic skill/interest lists from backend
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/skills`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_URL}/interests`).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([fetchedSkills, fetchedInterests]) => {
      if (fetchedSkills?.length)    setSkillOptions(toOptions(fetchedSkills));
      if (fetchedInterests?.length) setInterestOptions(toOptions(fetchedInterests));
    });
  }, []);

  const handleMoreLikeThis = useCallback(async (project) => {
    setSimilarModal({ open: true, sourceName: project.project_name, results: [], loading: true });
    try {
      const res = await fetch(`${API_URL}/similar/${project.project_id}`);
      const data = res.ok ? await res.json() : [];
      setSimilarModal(prev => ({ ...prev, results: data, loading: false }));
    } catch {
      setSimilarModal(prev => ({ ...prev, results: [], loading: false }));
    }
  }, []);

  const handleFeedback = useCallback((projectId, type) => {
    setCardFeedback(prev => {
      if (type === null) {
        const next = { ...prev };
        delete next[projectId];
        return next;
      }
      return { ...prev, [projectId]: type };
    });
  }, []);

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
    setHasFired(true);
    setError("");
    setLoading(true);
    setHasSearched(false);
    setShowBookmarks(false);

    try {
      const skillValues    = skills.map(s => s.value);
      const interestValues = interests.map(i => i.value);
      const levelValue     = level.value;

      const opts = {
        freeQuery,
        likedIds:    bookmarks.map(b => b.project_id),
        excludedIds: Object.entries(cardFeedback)
          .filter(([, v]) => v !== null)
          .map(([k]) => Number(k)),
      };

      const basePromise = fetchRecommendations(skillValues, interestValues, levelValue, opts);
      const whatIfPromise = hypotheticals.length > 0
        ? fetchRecommendations([...skillValues, ...hypotheticals], interestValues, levelValue, opts)
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
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {onGoBack && (
            <button className="nav-back-btn" onClick={onGoBack} title="Back to home">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M11 6.5H2M2 6.5L5.5 3M2 6.5L5.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Home
            </button>
          )}
          <div className="nav-logo">
            <span className="nav-logo-dot" />
            <span className="nav-logo-text">dev<span className="nav-logo-dot-text">.</span>recommender</span>
          </div>
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

      {/* ════════ CENTERED LAYOUT (before first search) ════════ */}
      {!hasFired && (
        <main className="main">
          <header className="hero">
            <p className="hero-eyebrow">ML-powered · TF-IDF + cosine similarity</p>
            <h1 className="hero-heading">
              What should you<br /><em>build next?</em>
            </h1>
            <p className="hero-sub">
              Tell us your skills and interests — we'll surface the projects most worth your time.
            </p>
          </header>

          <section className="form-panel">
            <form onSubmit={handleSubmit}>
              <div className="form-fields">
                <div className="form-field">
                  <label htmlFor="skills-input">Skills</label>
                  <Select inputId="skills-input" isMulti options={skillOptions}
                    value={skills} onChange={setSkills} classNamePrefix="rs"
                    placeholder="e.g. Python, React, Docker…" isClearable />
                </div>
                <div className="form-field">
                  <label htmlFor="interests-input">Interests</label>
                  <Select inputId="interests-input" isMulti options={interestOptions}
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
                <div className="form-field">
                  <label htmlFor="query-input">
                    Describe what you want to build
                    <span style={{ color: "var(--text-muted)", fontWeight: 400, marginLeft: 6 }}>(optional)</span>
                  </label>
                  <input
                    id="query-input" type="text"
                    value={freeQuery} onChange={e => setFreeQuery(e.target.value)}
                    placeholder="e.g. something with real-time data and live chat…"
                    style={{
                      width: "100%", boxSizing: "border-box",
                      background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-md)", padding: "10px 14px",
                      color: "var(--text-primary)", fontSize: "0.875rem", fontFamily: "inherit",
                      outline: "none", transition: "border-color 0.18s",
                    }}
                    onFocus={e => e.target.style.borderColor = "var(--border-active)"}
                    onBlur={e  => e.target.style.borderColor = "var(--border-default)"}
                  />
                </div>
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
        </main>
      )}

      {/* ════════ SIDEBAR LAYOUT (after first search fires) ════════ */}
      {hasFired && (
      <div className="app-layout">

        {/* LEFT SIDEBAR */}
        <aside className="app-sidebar">
          <div className="sidebar-header">
            <p className="sidebar-eyebrow">TF-IDF · Cosine Similarity</p>
            <h2 className="sidebar-title">Your Profile</h2>
            <p className="sidebar-sub">Tweak your stack and re-run anytime.</p>
          </div>

          <form onSubmit={handleSubmit} className="sidebar-form">
            <div className="form-fields">
              <div className="form-field">
                <label htmlFor="skills-input2">Skills</label>
                <Select inputId="skills-input2" isMulti options={skillOptions}
                  value={skills} onChange={setSkills} classNamePrefix="rs"
                  placeholder="e.g. Python, React, Docker…" isClearable />
              </div>
              <div className="form-field">
                <label htmlFor="interests-input2">Interests</label>
                <Select inputId="interests-input2" isMulti options={interestOptions}
                  value={interests} onChange={setInterests} classNamePrefix="rs"
                  placeholder="e.g. Machine Learning, Web Dev…" isClearable />
              </div>
              <div className="form-field">
                <label htmlFor="level-input2">Experience Level</label>
                <Select inputId="level-input2" options={LEVEL_OPTIONS}
                  value={level} onChange={setLevel} classNamePrefix="rs"
                  placeholder="Select your level…" isSearchable={false} />
              </div>
              <WhatIfPanel
                realSkills={skills.map(s => s.value)}
                hypotheticals={hypotheticals}
                onChange={setHypotheticals}
                loading={loading}
              />
              <div className="form-field">
                <label htmlFor="query-input2">
                  Free-text query
                  <span style={{ color: "var(--text-muted)", fontWeight: 400, marginLeft: 6 }}>(optional)</span>
                </label>
                <input
                  id="query-input2" type="text"
                  value={freeQuery} onChange={e => setFreeQuery(e.target.value)}
                  placeholder="e.g. real-time data with live chat…"
                  className="sidebar-text-input"
                  onFocus={e => e.target.style.borderColor = "var(--border-active)"}
                  onBlur={e  => e.target.style.borderColor = "var(--border-default)"}
                />
              </div>
            </div>
            {error && <div className="error-msg" role="alert">⚠ {error}</div>}
            <button type="submit" className="sidebar-run-btn" disabled={loading}>
              {loading
                ? <><span className="spinner" /> Analyzing…</>
                : hypotheticals.length > 0 ? "Compare →" : "Re-run →"
              }
            </button>
          </form>
        </aside>

        {/* RIGHT CONTENT */}
        <main className="app-content" ref={resultsRef}>

          {/* Loader */}
          {loading && (
            <div className="loader-wrap" aria-live="polite">
              <p>{hypotheticals.length > 0 ? "Running both scenarios…" : "Analyzing your profile…"}</p>
              <div className="skeleton-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-line short" style={{ marginBottom: 14 }} />
                    <div className="skeleton-line wide" />
                    <div className="skeleton-line mid" style={{ marginBottom: 18 }} />
                    <div className="skeleton-line wide" style={{ height: 7 }} />
                    <div className="skeleton-line short" style={{ height: 7 }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {!loading && (
            <>
              {/* DECIDE MODE */}
              {mode === "decide" && !showBookmarks && (
                <DecideMode results={baseResults} onSwitchExplore={() => setMode("explore")} />
              )}

              {mode === "explore" && (
                <>
                  {/* Saved bookmarks */}
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
                              isBookmarked={true} onToggleBookmark={() => toggleBookmark(p)}
                              onMoreLikeThis={handleMoreLikeThis}
                              feedbackType={cardFeedback[p.project_id]}
                              onFeedback={handleFeedback} />
                          ))}
                        </div>
                      ) : (
                        <div className="content-empty">
                          <div className="content-empty__glyph">◎</div>
                          <p className="content-empty__text">No saved projects yet.<br />Star any card to save it here.</p>
                        </div>
                      )}
                    </section>
                  )}

                  {/* Diff / What-If comparison */}
                  {!showBookmarks && showDiff && (
                    <section className="results" style={{ animation: "fade-up 0.38s ease both" }}>
                      <div className="results-header" style={{ marginBottom: 16 }}>
                        <h2>Scenario Comparison</h2>
                        <span className="results-count">+{unlockedIds.size} unlocked</span>
                        <div className="results-divider" />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: "0.64rem", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Hypothetical:</span>
                        {hypotheticals.map(s => (
                          <span key={s} style={{ fontFamily: "var(--mono)", fontSize: "0.67rem", fontWeight: 500, padding: "2px 8px", borderRadius: "var(--radius-sm)", border: "1.5px dashed var(--accent-cyan)", color: "var(--accent-cyan)", background: "rgba(0,217,255,0.05)" }}>+ {s}</span>
                        ))}
                      </div>
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
                                onToggleBookmark={() => toggleBookmark(p)}
                                onMoreLikeThis={handleMoreLikeThis}
                                feedbackType={cardFeedback[p.project_id]}
                                onFeedback={handleFeedback} />
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
                                isUnlocked={unlockedIds.has(p.project_id)}
                                onMoreLikeThis={handleMoreLikeThis}
                                feedbackType={cardFeedback[p.project_id]}
                                onFeedback={handleFeedback} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Normal results */}
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
                              onToggleBookmark={() => toggleBookmark(p)}
                              onMoreLikeThis={handleMoreLikeThis}
                              feedbackType={cardFeedback[p.project_id]}
                              onFeedback={handleFeedback} />
                          ))}
                        </div>
                      ) : (
                        <div className="content-empty">
                          <div className="content-empty__glyph">◎</div>
                          <p className="content-empty__text">No matches found.<br />Try broadening your skills or changing level.</p>
                        </div>
                      )}
                    </section>
                  )}

                  {/* Initial empty state */}
                  {!showBookmarks && !hasSearched && (
                    <div className="content-empty content-empty--welcome">
                      <div className="content-empty__grid-bg" />
                      <div className="content-empty__inner">
                        <div className="content-empty__glyph content-empty__glyph--lg">◈</div>
                        <h3 className="content-empty__heading">Ready when you are</h3>
                        <p className="content-empty__text">
                          Configure your skills, interests, and level<br />
                          on the left — then hit <em>Get Recommendations</em>.
                        </p>
                        <div className="content-empty__hint">
                          <span className="content-empty__hint-dot" />
                          TF-IDF · Cosine Similarity · Hybrid Scoring
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>
      )}

      {similarModal.open && (
        <SimilarModal
          sourceName={similarModal.sourceName}
          results={similarModal.results}
          loading={similarModal.loading}
          onClose={() => setSimilarModal(prev => ({ ...prev, open: false }))}
        />
      )}
    </div>
  );
}
