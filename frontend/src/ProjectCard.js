import React from "react";

const GitHubIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const DIFFICULTY_BADGE = {
  Beginner:     { bg: "var(--success-dim)",  color: "var(--success)",  border: "rgba(16,185,129,0.2)"  },
  Intermediate: { bg: "var(--warning-dim)",  color: "var(--warning)",  border: "rgba(245,158,11,0.2)"  },
  Advanced:     { bg: "var(--danger-dim)",   color: "var(--danger)",   border: "rgba(239,68,68,0.2)"   },
};

function ProjectCard({ project, isBookmarked, onToggleBookmark, isUnlocked = false }) {
  const difficulty = project.difficulty || "Beginner";
  const badge      = DIFFICULTY_BADGE[difficulty] || DIFFICULTY_BADGE.Beginner;
  const techStack  = Array.isArray(project.tech_stack) ? project.tech_stack : [];
  const missing    = Array.isArray(project.missing_skills) ? project.missing_skills : [];
  const matchPct   = project.score != null ? Math.round(project.score * 100) : null;

  return (
    <article
      style={{
        position: "relative",
        background: isUnlocked ? "rgba(0,217,255,0.03)" : "var(--bg-surface)",
        border: `1px solid ${isUnlocked ? "rgba(0,217,255,0.22)" : "var(--border-subtle)"}`,
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        boxShadow: isUnlocked ? "0 0 18px rgba(0,217,255,0.07)" : "none",
        animation: "card-in 0.35s ease both",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = isUnlocked ? "var(--accent-cyan)" : "var(--border-active)";
        e.currentTarget.style.transform   = "translateY(-2px)";
        e.currentTarget.style.boxShadow   = isUnlocked
          ? "0 8px 28px rgba(0,217,255,0.14)"
          : "0 8px 28px rgba(0,0,0,0.28)";
        const bar = e.currentTarget.querySelector(".card-accent-bar");
        if (bar) bar.style.opacity = "1";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isUnlocked ? "rgba(0,217,255,0.22)" : "var(--border-subtle)";
        e.currentTarget.style.transform   = "translateY(0)";
        e.currentTarget.style.boxShadow   = isUnlocked ? "0 0 18px rgba(0,217,255,0.07)" : "none";
        const bar = e.currentTarget.querySelector(".card-accent-bar");
        if (bar) bar.style.opacity = "0";
      }}
    >
      {/* accent bar */}
      <div className="card-accent-bar" style={{
        position: "absolute",
        top: 0, left: 0,
        width: 3,
        height: "100%",
        background: isUnlocked
          ? "var(--accent-cyan)"
          : "linear-gradient(180deg, var(--accent-cyan), var(--accent-violet))",
        opacity: isUnlocked ? 0.6 : 0,
        transition: "opacity 0.2s",
        pointerEvents: "none",
      }} />

      <div style={{ padding: "20px 22px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
          <div>
            {/* Unlocked badge */}
            {isUnlocked && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontFamily: "var(--mono)",
                fontSize: "0.6rem",
                fontWeight: 700,
                color: "var(--accent-cyan)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}>
                <span style={{ fontSize: "0.65rem" }}>✦</span>
                Unlocked
              </div>
            )}

            <h3 style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
              lineHeight: 1.3,
              marginBottom: 7,
            }}>
              {project.project_name}
            </h3>

            <span style={{
              display: "inline-flex",
              alignItems: "center",
              fontFamily: "var(--mono)",
              fontSize: "0.64rem",
              fontWeight: 600,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              background: badge.bg,
              color: badge.color,
              border: `1px solid ${badge.border}`,
            }}>
              {difficulty}
            </span>
          </div>

          <button
            onClick={onToggleBookmark}
            title={isBookmarked ? "Remove bookmark" : "Bookmark this project"}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this project"}
            style={{
              background: isBookmarked ? "var(--accent-violet-dim)" : "none",
              border: `1px solid ${isBookmarked ? "var(--accent-violet)" : "var(--border-subtle)"}`,
              borderRadius: "var(--radius-sm)",
              color: isBookmarked ? "var(--accent-violet-light)" : "var(--text-muted)",
              cursor: "pointer",
              padding: "6px 8px",
              lineHeight: 1,
              fontSize: "0.9rem",
              flexShrink: 0,
              transition: "all 0.18s",
            }}
          >
            {isBookmarked ? "★" : "☆"}
          </button>
        </div>

        {/* ── Description ── */}
        {project.description && (
          <p style={{
            fontSize: "0.855rem",
            color: "var(--text-secondary)",
            lineHeight: 1.62,
            marginBottom: 14,
          }}>
            {project.description}
          </p>
        )}

        {/* ── Reason ── */}
        {project.reason && (
          <div style={{
            display: "flex",
            gap: 8,
            background: "var(--bg-elevated)",
            borderRadius: "var(--radius-sm)",
            padding: "9px 12px",
            marginBottom: 14,
          }}>
            <span style={{ fontSize: "0.75rem", flexShrink: 0, marginTop: 1, opacity: 0.7 }}>💡</span>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5, fontStyle: "italic" }}>
              {project.reason}
            </p>
          </div>
        )}

        {/* ── Tech Stack ── */}
        {techStack.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{
              fontFamily: "var(--mono)", fontSize: "0.61rem", fontWeight: 500,
              color: "var(--text-muted)", letterSpacing: "0.09em",
              textTransform: "uppercase", marginBottom: 6,
            }}>Tech Stack</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {techStack.map(tech => (
                <span key={tech} style={{
                  fontFamily: "var(--mono)", fontSize: "0.67rem", fontWeight: 500,
                  padding: "3px 8px", borderRadius: "var(--radius-sm)",
                  background: "var(--bg-elevated)", color: "var(--text-secondary)",
                  border: "1px solid var(--border-default)",
                }}>{tech}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── Missing Skills ── */}
        {missing.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{
              fontFamily: "var(--mono)", fontSize: "0.61rem", fontWeight: 500,
              color: "var(--text-muted)", letterSpacing: "0.09em",
              textTransform: "uppercase", marginBottom: 6,
            }}>Skills to learn</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {missing.map(skill => (
                <span key={skill} style={{
                  fontFamily: "var(--mono)", fontSize: "0.67rem", fontWeight: 500,
                  padding: "3px 8px", borderRadius: "var(--radius-sm)",
                  background: "transparent", color: "var(--accent-cyan)",
                  border: "1px solid rgba(0,217,255,0.24)",
                }}>{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          marginTop: 14, paddingTop: 14,
          borderTop: "1px solid var(--border-subtle)",
        }}>
          {matchPct != null && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                flex: 1, height: 3,
                background: "var(--bg-elevated)",
                borderRadius: 2, overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: `${Math.min(matchPct, 100)}%`,
                  borderRadius: 2,
                  background: isUnlocked
                    ? "var(--accent-cyan)"
                    : "linear-gradient(90deg, var(--accent-violet), var(--accent-cyan))",
                  transition: "width 0.65s cubic-bezier(0.4,0,0.2,1)",
                }} />
              </div>
              <span style={{
                fontFamily: "var(--mono)", fontSize: "0.7rem", fontWeight: 600,
                color: "var(--text-muted)", whiteSpace: "nowrap",
              }}>
                <span style={{ color: isUnlocked ? "var(--accent-cyan)" : "var(--accent-cyan)" }}>
                  {matchPct}%
                </span> match
              </span>
            </div>
          )}

          {project.github_link && (
            <a
              href={project.github_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontFamily: "var(--mono)", fontSize: "0.7rem", fontWeight: 500,
                color: "var(--text-muted)", textDecoration: "none",
                padding: "5px 10px",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                whiteSpace: "nowrap",
                transition: "color 0.15s, border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color       = "var(--text-primary)";
                e.currentTarget.style.borderColor = "var(--border-active)";
                e.currentTarget.style.background  = "var(--bg-elevated)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color       = "var(--text-muted)";
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.background  = "transparent";
              }}
            >
              <GitHubIcon /> GitHub ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;      }}
    >
      <AccentBar />

      <div style={cardInnerStyle}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
          <div>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
              marginBottom: 7,
            }}>
              {project.project_name}
            </h3>

            {/* Difficulty badge */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontFamily: 'var(--mono)',
              fontSize: '0.64rem',
              fontWeight: 600,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              background: badgeStyle.bg,
              color: badgeStyle.color,
              border: `1px solid ${badgeStyle.border}`,
            }}>
              {difficulty}
            </span>
          </div>

          {/* Bookmark button */}
          <button
            onClick={onToggleBookmark}
            title={isBookmarked ? "Remove bookmark" : "Bookmark this project"}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this project"}
            style={{
              background: isBookmarked ? 'var(--accent-violet-dim)' : 'none',
              border: `1px solid ${isBookmarked ? 'var(--accent-violet)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-sm)',
              color: isBookmarked ? 'var(--accent-violet-light)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px 8px',
              lineHeight: 1,
              fontSize: '0.9rem',
              flexShrink: 0,
              transition: 'all 0.18s',
            }}
          >
            {isBookmarked ? "★" : "☆"}
          </button>
        </div>

        {/* ── Description ── */}
        {project.description && (
          <p style={{
            fontSize: '0.855rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.62,
            marginBottom: 14,
          }}>
            {project.description}
          </p>
        )}

        {/* ── Reason ── */}
        {project.reason && (
          <div style={{
            display: 'flex',
            gap: 8,
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-sm)',
            padding: '9px 12px',
            marginBottom: 14,
          }}>
            <span style={{ fontSize: '0.75rem', flexShrink: 0, marginTop: 1, opacity: 0.7 }}>💡</span>
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              fontStyle: 'italic',
            }}>
              {project.reason}
            </p>
          </div>
        )}

        {/* ── Tech Stack ── */}
        {techStack.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.61rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}>
              Tech Stack
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {techStack.map((tech) => (
                <span key={tech} style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.67rem',
                  fontWeight: 500,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-default)',
                }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Missing Skills ── */}
        {missing.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.61rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}>
              Skills to learn
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {missing.map((skill) => (
                <span key={skill} style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.67rem',
                  fontWeight: 500,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'transparent',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(0,217,255,0.24)',
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer: match bar + github ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginTop: 14,
          paddingTop: 14,
          borderTop: '1px solid var(--border-subtle)',
        }}>
          {/* Match bar */}
          {matchPct != null && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                flex: 1,
                height: 3,
                background: 'var(--bg-elevated)',
                borderRadius: 2,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(matchPct, 100)}%`,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, var(--accent-violet), var(--accent-cyan))',
                  transition: 'width 0.65s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}>
                <span style={{ color: 'var(--accent-cyan)' }}>{matchPct}%</span> match
              </span>
            </div>
          )}

          {/* GitHub link */}
          {project.github_link && (
            <a
              href={project.github_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontFamily: 'var(--mono)',
                fontSize: '0.7rem',
                fontWeight: 500,
                color: 'var(--text-muted)',
                textDecoration: 'none',
                padding: '5px 10px',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s, border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color        = 'var(--text-primary)';
                e.currentTarget.style.borderColor  = 'var(--border-active)';
                e.currentTarget.style.background   = 'var(--bg-elevated)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color        = 'var(--text-muted)';
                e.currentTarget.style.borderColor  = 'var(--border-subtle)';
                e.currentTarget.style.background   = 'transparent';
              }}
            >
              <GitHubIcon />
              GitHub ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;
