import React from "react";

const DIFFICULTY_COLORS = {
  Beginner: "#22c55e",
  Intermediate: "#f59e0b",
  Advanced: "#ef4444",
};

function ProjectCard({ project, isBookmarked, onToggleBookmark }) {
  const badgeColor = DIFFICULTY_COLORS[project.difficulty] || "#6366f1";

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{project.project_name}</h3>
        <button
          className={`bookmark-btn ${isBookmarked ? "bookmarked" : ""}`}
          onClick={onToggleBookmark}
          title={isBookmarked ? "Remove bookmark" : "Bookmark this project"}
        >
          {isBookmarked ? "\u2605" : "\u2606"}
        </button>
      </div>

      <span className="difficulty-badge" style={{ background: badgeColor }}>
        {project.difficulty}
      </span>

      <p className="card-desc">{project.description}</p>

      {project.reason && (
        <div className="card-reason">
          <span className="reason-icon">&#x1f4a1;</span>
          {project.reason}
        </div>
      )}

      <div className="tech-stack">
        {project.tech_stack.map((tech) => (
          <span key={tech} className="tech-tag">
            {tech}
          </span>
        ))}
      </div>

      {project.missing_skills && project.missing_skills.length > 0 && (
        <div className="skill-gaps">
          <span className="gaps-label">Skills to learn:</span>
          {project.missing_skills.map((skill) => (
            <span key={skill} className="gap-tag">
              {skill}
            </span>
          ))}
        </div>
      )}

      {project.score !== undefined && (
        <div className="score-bar">
          <div className="score-fill" style={{ width: `${Math.min(project.score * 100, 100)}%` }} />
          <span className="score-label">Match: {(project.score * 100).toFixed(0)}%</span>
        </div>
      )}

      {project.github_link && (
        <a
          href={project.github_link}
          target="_blank"
          rel="noopener noreferrer"
          className="github-btn"
        >
          View on GitHub &rarr;
        </a>
      )}
    </div>
  );
}

export default ProjectCard;
