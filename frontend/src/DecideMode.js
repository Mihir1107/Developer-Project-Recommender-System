import React, { useState } from "react";

const GitHubIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const DIFFICULTY_STYLE = {
  Beginner:     { color: "var(--success)",  bg: "var(--success-dim)" },
  Intermediate: { color: "var(--warning)",  bg: "var(--warning-dim)" },
  Advanced:     { color: "var(--danger)",   bg: "var(--danger-dim)"  },
};

/* strip "it is related to your overall profile" type reasons — surface strongest signal */
function bestReason(project) {
  if (project.reason && project.reason.length > 20 &&
      !project.reason.toLowerCase().includes("overall profile")) {
    return project.reason;
  }
  const tech = Array.isArray(project.tech_stack) ? project.tech_stack.slice(0, 3).join(", ") : "";
  return tech ? `Strong match with your stack — ${tech}` : "Recommended based on your profile.";
}

function DecideCard({ project, rank, committed, onCommit }) {
  const pct         = project.score != null ? Math.round(project.score * 100) : 0;
  const diff        = DIFFICULTY_STYLE[project.difficulty] || DIFFICULTY_STYLE.Beginner;
  const techStack   = Array.isArray(project.tech_stack) ? project.tech_stack : [];
  const missing     = Array.isArray(project.missing_skills) ? project.missing_skills : [];
  const rankLabel   = ["#1 Best fit", "#2 Strong pick", "#3 Worth considering"][rank] || `#${rank + 1}`;
  const rankColor   = ["var(--accent-cyan)", "var(--accent-violet-light)", "var(--text-muted)"][rank];

  return (
    <div style={{
      flex: "1 1 0",
      minWidth: 200,
      background: committed ? "rgba(124,58,237,0.07)" : "var(--bg-surface)",
      border: `1px solid ${committed ? "var(--accent-violet)" : rank === 0 ? "var(--border-active)" : "var(--border-subtle)"}`,
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      transition: "border-color 0.2s, box-shadow 0.2s",
      boxShadow: committed ? "0 0 24px var(--accent-violet-glow)" : rank === 0 ? "0 0 16px rgba(0,217,255,0.06)" : "none",
      animation: "card-in 0.35s ease both",
      animationDelay: `${rank * 0.08}s`,
    }}>

      {/* rank strip */}
      <div style={{
        padding: "8px 16px",
        borderBottom: `1px solid ${rank === 0 ? "var(--border-active)" : "var(--border-subtle)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{
          fontFamily: "var(--mono)",
          fontSize: "0.65rem",
          fontWeight: 700,
          color: rankColor,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          {rankLabel}
        </span>
        <span style={{
          fontFamily: "var(--mono)",
          fontSize: "0.68rem",
          fontWeight: 700,
          color: "var(--accent-cyan)",
        }}>
          {pct}%
        </span>
      </div>

      {/* body */}
      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>

        {/* title + badge */}
        <div>
          <h3 style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
            marginBottom: 7,
          }}>
            {project.project_name}
          </h3>
          <span style={{
            fontFamily: "var(--mono)",
            fontSize: "0.61rem",
            fontWeight: 600,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            padding: "2px 7px",
            borderRadius: "var(--radius-sm)",
            background: diff.bg,
            color: diff.color,
            border: `1px solid ${diff.color}33`,
          }}>
            {project.difficulty || "Beginner"}
          </span>
        </div>

        {/* match bar */}
        <div>
          <div style={{
            height: 3,
            background: "var(--bg-elevated)",
            borderRadius: 2,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${Math.min(pct, 100)}%`,
              borderRadius: 2,
              background: "linear-gradient(90deg, var(--accent-violet), var(--accent-cyan))",
              transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
        </div>

        {/* strongest reason */}
        <div style={{
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-sm)",
          padding: "9px 11px",
          flex: 1,
        }}>
          <p style={{
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            color: "var(--text-muted)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 5,
          }}>Why this</p>
          <p style={{
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}>
            {bestReason(project)}
          </p>
        </div>

        {/* tech tags — compact */}
        {techStack.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {techStack.slice(0, 4).map(t => (
              <span key={t} style={{
                fontFamily: "var(--mono)",
                fontSize: "0.63rem",
                padding: "2px 6px",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-elevated)",
                color: "var(--text-muted)",
                border: "1px solid var(--border-subtle)",
              }}>{t}</span>
            ))}
            {techStack.length > 4 && (
              <span style={{
                fontFamily: "var(--mono)",
                fontSize: "0.63rem",
                padding: "2px 6px",
                color: "var(--text-muted)",
              }}>+{techStack.length - 4}</span>
            )}
          </div>
        )}

        {/* missing skills */}
        {missing.length > 0 && (
          <div>
            <p style={{
              fontFamily: "var(--mono)",
              fontSize: "0.61rem",
              color: "var(--text-muted)",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              marginBottom: 5,
            }}>You'll learn</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {missing.slice(0, 3).map(s => (
                <span key={s} style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.63rem",
                  padding: "2px 6px",
                  borderRadius: "var(--radius-sm)",
                  background: "transparent",
                  color: "var(--accent-cyan)",
                  border: "1px solid rgba(0,217,255,0.22)",
                }}>{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* commit footer */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid var(--border-subtle)",
        display: "flex",
        gap: 8,
      }}>
        <button
          onClick={() => onCommit(project)}
          style={{
            flex: 1,
            padding: "9px 12px",
            background: committed ? "var(--accent-violet)" : "transparent",
            border: `1px solid ${committed ? "var(--accent-violet)" : "var(--border-active)"}`,
            borderRadius: "var(--radius-md)",
            color: committed ? "#fff" : "var(--accent-violet-light)",
            fontFamily: "var(--mono)",
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            cursor: "pointer",
            transition: "all 0.18s",
          }}
          onMouseEnter={e => {
            if (!committed) {
              e.currentTarget.style.background = "var(--accent-violet-dim)";
              e.currentTarget.style.borderColor = "var(--accent-violet)";
            }
          }}
          onMouseLeave={e => {
            if (!committed) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "var(--border-active)";
            }
          }}
        >
          {committed ? "✓ Committed" : "Commit to this →"}
        </button>

        {project.github_link && (
          <a
            href={project.github_link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "9px 10px",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-muted)",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--border-active)";
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.background = "var(--bg-elevated)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <GitHubIcon />
          </a>
        )}
      </div>
    </div>
  );
}

export default function DecideMode({ results, onSwitchExplore }) {
  const [committed, setCommitted] = useState(null);
  const top3 = results.slice(0, 3);

  if (top3.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "56px 20px", color: "var(--text-muted)" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "1.2rem", marginBottom: 14, opacity: 0.4 }}>◎</div>
        <p style={{ fontSize: "0.875rem", marginBottom: 16 }}>No results yet — go explore first.</p>
        <button
          onClick={onSwitchExplore}
          style={{
            background: "none",
            border: "1px solid var(--border-active)",
            borderRadius: "var(--radius-md)",
            color: "var(--accent-cyan)",
            fontFamily: "var(--mono)",
            fontSize: "0.72rem",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >← Back to Explore</button>
      </div>
    );
  }

  return (
    <section style={{ animation: "fade-up 0.38s ease both" }}>

      {/* header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
        gap: 12,
      }}>
        <div>
          <h2 style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: 3,
          }}>
            Your top picks
          </h2>
          <p style={{
            fontFamily: "var(--mono)",
            fontSize: "0.65rem",
            color: "var(--text-muted)",
            letterSpacing: "0.05em",
          }}>
            Commit to one. Clarity beats optionality.
          </p>
        </div>
        <button
          onClick={onSwitchExplore}
          style={{
            background: "none",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-muted)",
            fontFamily: "var(--mono)",
            fontSize: "0.68rem",
            padding: "7px 13px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "var(--border-active)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "var(--border-subtle)";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          ← See all results
        </button>
      </div>

      {/* committed banner */}
      {committed && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          background: "rgba(124,58,237,0.08)",
          border: "1px solid rgba(124,58,237,0.25)",
          borderRadius: "var(--radius-md)",
          marginBottom: 20,
          animation: "fade-up 0.3s ease both",
        }}>
          <span style={{ fontSize: "0.9rem" }}>🎯</span>
          <div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>
              You're building: {committed.project_name}
            </p>
            <p style={{ fontFamily: "var(--mono)", fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 2 }}>
              Saved to bookmarks. Go build it.
            </p>
          </div>
        </div>
      )}

      {/* 3 cards */}
      <div style={{
        display: "flex",
        gap: 14,
        alignItems: "stretch",
        flexWrap: "wrap",
      }}>
        {top3.map((project, i) => (
          <DecideCard
            key={project.project_id}
            project={project}
            rank={i}
            committed={committed?.project_id === project.project_id}
            onCommit={(p) => setCommitted(prev =>
              prev?.project_id === p.project_id ? null : p
            )}
          />
        ))}
      </div>
    </section>
  );
}
