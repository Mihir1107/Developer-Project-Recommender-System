import React, { useEffect } from "react";

const DIFFICULTY_BADGE = {
  Beginner:     { color: "var(--success)",  border: "rgba(16,185,129,0.3)"  },
  Intermediate: { color: "var(--warning)",  border: "rgba(245,158,11,0.3)"  },
  Advanced:     { color: "var(--danger)",   border: "rgba(239,68,68,0.3)"   },
};

const GitHubIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

function SimilarCard({ project }) {
  const badge = DIFFICULTY_BADGE[project.difficulty] || DIFFICULTY_BADGE.Beginner;
  const matchPct = project.score != null ? Math.round(project.score * 100) : null;

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      padding: "16px 18px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      transition: "border-color 0.18s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-active)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <h4 style={{
          fontSize: "0.9rem", fontWeight: 600,
          color: "var(--text-primary)", lineHeight: 1.3, margin: 0,
        }}>
          {project.project_name}
        </h4>
        <span style={{
          fontFamily: "var(--mono)", fontSize: "0.6rem", fontWeight: 600,
          letterSpacing: "0.07em", textTransform: "uppercase",
          padding: "2px 7px", borderRadius: "var(--radius-sm)",
          color: badge.color, border: `1px solid ${badge.border}`,
          background: "transparent", whiteSpace: "nowrap", flexShrink: 0,
        }}>
          {project.difficulty}
        </span>
      </div>

      <p style={{
        fontSize: "0.8rem", color: "var(--text-secondary)",
        lineHeight: 1.55, margin: 0,
      }}>
        {project.description}
      </p>

      {project.tech_stack?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {project.tech_stack.map(tech => (
            <span key={tech} style={{
              fontFamily: "var(--mono)", fontSize: "0.63rem", fontWeight: 500,
              padding: "2px 7px", borderRadius: "var(--radius-sm)",
              background: "var(--bg-elevated)", color: "var(--text-secondary)",
              border: "1px solid var(--border-default)",
            }}>{tech}</span>
          ))}
        </div>
      )}

      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        paddingTop: 8, borderTop: "1px solid var(--border-subtle)",
        marginTop: "auto",
      }}>
        {matchPct != null && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              flex: 1, height: 2, background: "var(--bg-elevated)",
              borderRadius: 2, overflow: "hidden",
            }}>
              <div style={{
                height: "100%", width: `${Math.min(matchPct * 4, 100)}%`,
                background: "linear-gradient(90deg, var(--accent-violet), var(--accent-cyan))",
                borderRadius: 2,
              }} />
            </div>
            <span style={{
              fontFamily: "var(--mono)", fontSize: "0.66rem",
              color: "var(--text-muted)", whiteSpace: "nowrap",
            }}>
              <span style={{ color: "var(--accent-cyan)" }}>{matchPct}%</span> sim
            </span>
          </div>
        )}

        {project.github_link && (
          <a
            href={project.github_link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontFamily: "var(--mono)", fontSize: "0.67rem", fontWeight: 500,
              color: "var(--text-muted)", textDecoration: "none",
              padding: "4px 9px",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              whiteSpace: "nowrap",
              transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.borderColor = "var(--border-active)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.borderColor = "var(--border-subtle)";
            }}
          >
            <GitHubIcon /> GitHub ↗
          </a>
        )}
      </div>
    </div>
  );
}

export default function SimilarModal({ sourceName, results, loading, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Similar projects"
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px 16px",
        animation: "fade-up 0.22s ease both",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-base)",
          border: "1px solid var(--border-active)",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: 860,
          maxHeight: "88vh",
          overflowY: "auto",
          padding: "28px 28px 24px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", gap: 12, marginBottom: 20,
        }}>
          <div>
            <p style={{
              fontFamily: "var(--mono)", fontSize: "0.6rem", fontWeight: 500,
              color: "var(--accent-cyan)", letterSpacing: "0.1em",
              textTransform: "uppercase", marginBottom: 4,
            }}>
              Similar projects
            </p>
            <h2 style={{
              fontSize: "1.05rem", fontWeight: 600,
              color: "var(--text-primary)", letterSpacing: "-0.01em",
            }}>
              Because you liked <em style={{ fontStyle: "normal", color: "var(--accent-cyan)" }}>{sourceName}</em>
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-muted)", cursor: "pointer",
              fontSize: "1rem", lineHeight: 1, padding: "6px 9px",
              flexShrink: 0, transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-active)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <div className="loader" />
          </div>
        ) : results.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 14,
          }}>
            {results.map(p => <SimilarCard key={p.project_id} project={p} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-glyph">◎</div>
            <p>No similar projects found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
