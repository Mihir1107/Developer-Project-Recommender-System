import React, { useState } from "react";
import Select from "react-select";

const ALL_SKILLS = [
  "Python", "JavaScript", "TypeScript", "React", "Node.js", "C++", "Java",
  "Go", "Rust", "Ruby", "Swift", "Kotlin", "SQL", "MongoDB", "PostgreSQL",
  "Docker", "Kubernetes", "AWS", "Flask", "FastAPI", "Django", "Express",
  "TensorFlow", "PyTorch", "scikit-learn", "OpenCV", "Pandas", "Solidity",
  "Web3.js", "HTML", "CSS", "Redis", "GraphQL", "Firebase", "Linux", "Bash",
  "Git", "Next.js", "Vue", "Angular", "Tailwind CSS", "WebSockets", "GCP", "Azure",
].map((s) => ({ value: s, label: s }));

export default function WhatIfPanel({ realSkills, hypotheticals, onChange, loading }) {
  const [open, setOpen] = useState(false);

  // filter out skills user already has
  const available = ALL_SKILLS.filter(
    (o) => !realSkills.includes(o.value)
  );

  return (
    <div style={{ marginTop: 16 }}>
      {/* Collapsed trigger */}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "1px dashed var(--border-active)",
            borderRadius: "var(--radius-md)",
            padding: "9px 14px",
            color: "var(--accent-cyan)",
            fontFamily: "var(--mono)",
            fontSize: "0.72rem",
            fontWeight: 500,
            letterSpacing: "0.06em",
            cursor: "pointer",
            width: "100%",
            transition: "border-color 0.18s, background 0.18s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--accent-cyan-dim)"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >
          <span style={{ fontSize: "0.9rem" }}>⟡</span>
          What if I also knew…
          {hypotheticals.length > 0 && (
            <span style={{
              marginLeft: "auto",
              background: "var(--accent-cyan)",
              color: "var(--bg-base)",
              borderRadius: 99,
              fontSize: "0.62rem",
              fontWeight: 700,
              padding: "1px 7px",
            }}>
              {hypotheticals.length} active
            </span>
          )}
        </button>
      ) : (
        <div style={{
          border: "1px dashed var(--border-active)",
          borderRadius: "var(--radius-md)",
          padding: "14px 16px",
          background: "rgba(0,217,255,0.03)",
          position: "relative",
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontFamily: "var(--mono)",
                fontSize: "0.65rem",
                fontWeight: 500,
                color: "var(--accent-cyan)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>
                ⟡ What-If Simulator
              </span>
              <span style={{
                fontFamily: "var(--mono)",
                fontSize: "0.6rem",
                color: "var(--text-muted)",
              }}>
                — add skills you don't have yet
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "1rem",
                lineHeight: 1,
                padding: 2,
              }}
            >×</button>
          </div>

          {/* Select */}
          <Select
            isMulti
            options={available}
            value={hypotheticals.map(s => ({ value: s, label: s }))}
            onChange={(opts) => onChange((opts || []).map(o => o.value))}
            classNamePrefix="rs"
            placeholder="e.g. Docker, Kubernetes, AWS…"
            isClearable
            isDisabled={loading}
          />

          {/* Ghost pill preview */}
          {hypotheticals.length > 0 && (
            <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {hypotheticals.map(skill => (
                <span key={skill} style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontFamily: "var(--mono)",
                  fontSize: "0.68rem",
                  fontWeight: 500,
                  padding: "3px 9px",
                  borderRadius: "var(--radius-sm)",
                  border: "1.5px dashed var(--accent-cyan)",
                  color: "var(--accent-cyan)",
                  opacity: 0.82,
                  background: "rgba(0,217,255,0.05)",
                  letterSpacing: "0.02em",
                }}>
                  <span style={{ fontSize: "0.6rem", fontWeight: 700 }}>+</span>
                  {skill}
                </span>
              ))}
            </div>
          )}

          {hypotheticals.length > 0 && (
            <p style={{
              fontFamily: "var(--mono)",
              fontSize: "0.63rem",
              color: "var(--text-muted)",
              marginTop: 10,
              letterSpacing: "0.04em",
            }}>
              Hit "Get Recommendations" to see what these unlock →
            </p>
          )}
        </div>
      )}
    </div>
  );
}
