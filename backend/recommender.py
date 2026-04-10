"""
Recommender engine using TF-IDF + cosine similarity with hybrid scoring.
"""

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

DIFFICULTY_LEVELS = {"beginner": 1, "intermediate": 2, "advanced": 3}


class ProjectRecommender:
    def __init__(self, csv_path: str):
        self.df = pd.read_csv(csv_path, sep=",")
        self._preprocess()
        self._build_tfidf()

    def _preprocess(self):
        """Clean and normalize fields. Build corpus for TF-IDF."""
        for col in ("tags", "tech_stack", "description"):
            self.df[col] = self.df[col].fillna("")

        self.df["difficulty"] = self.df["difficulty"].str.strip().str.lower()

        # Corpus uses space-separated text for vectorization
        self.df["corpus"] = (
            self.df["description"]
            + " "
            + self.df["tags"].str.replace(";", " ")
            + " "
            + self.df["tech_stack"].str.replace(";", " ")
        ).str.lower()

    def _build_tfidf(self):
        self.vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df["corpus"])

    def _filter_by_difficulty(self, level: str) -> pd.DataFrame:
        max_level = DIFFICULTY_LEVELS.get(level.lower(), 3)
        mask = self.df["difficulty"].map(lambda d: DIFFICULTY_LEVELS.get(d, 3) <= max_level)
        return self.df[mask].copy()

    def _detect_skill_gaps(self, user_skills: list[str], project_tech: str) -> list[str]:
        user_lower = {s.lower().strip() for s in user_skills}
        project_lower = {s.lower().strip() for s in project_tech.split(";")}
        return sorted(project_lower - user_lower)

    def _generate_reason(
        self, skills: list[str], interests: list[str], row: pd.Series
    ) -> str:
        reasons = []
        tech_set = {t.lower().strip() for t in row["tech_stack"].split(";")}
        tags_set = {t.lower().strip() for t in row["tags"].split(";")}

        matching_skills = [s for s in skills if s.lower().strip() in tech_set]
        matching_interests = [i for i in interests if i.lower().strip() in tags_set]

        if matching_skills:
            reasons.append(f"matches your skills in {', '.join(matching_skills)}")
        if matching_interests:
            reasons.append(f"aligns with your interest in {', '.join(matching_interests)}")
        if not reasons:
            reasons.append("is related to your overall profile")

        return "Recommended because it " + " and ".join(reasons) + "."

    def recommend(
        self,
        skills: list[str],
        interests: list[str],
        level: str,
        top_n: int = 5,
        free_query: str = "",
        liked_ids: list[int] | None = None,
        excluded_ids: list[int] | None = None,
    ) -> list[dict]:
        """
        Pipeline:
        1. Filter by difficulty; drop user-excluded projects
        2. TF-IDF cosine similarity against user query (+ optional free text)
        3. Hybrid score = 0.7 * similarity + 0.3 * popularity
        4. Feedback boost: add 0.25 * avg_similarity_to_liked_projects
        5. Return top N with explanations, skill gaps, and confidence level
        """
        filtered = self._filter_by_difficulty(level)
        if filtered.empty:
            return []

        # Drop projects the user flagged as too easy / too hard
        if excluded_ids:
            filtered = filtered[~filtered["project_id"].isin(excluded_ids)]
        if filtered.empty:
            return []

        filtered_indices = filtered.index.tolist()
        filtered_tfidf = self.tfidf_matrix[filtered_indices]

        # Combine profile query with optional free-text description
        base_query = " ".join(skills + interests).lower()
        query = f"{base_query} {free_query.lower()}".strip() if free_query.strip() else base_query
        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, filtered_tfidf).flatten()

        popularity = filtered["popularity_score"].values
        scores = 0.7 * similarities + 0.3 * popularity

        # Feedback loop: boost candidates similar to bookmarked/liked projects
        if liked_ids:
            liked_rows = self.df[self.df["project_id"].isin(liked_ids)]
            if not liked_rows.empty:
                liked_vecs = self.tfidf_matrix[liked_rows.index.tolist()]
                liked_sims = cosine_similarity(liked_vecs, filtered_tfidf).mean(axis=0)
                scores = scores + 0.25 * liked_sims

        top_idx = scores.argsort()[::-1][:top_n]

        results = []
        for i in top_idx:
            row = filtered.iloc[i]
            raw_sim = float(similarities[i])
            confidence = "high" if raw_sim >= 0.25 else "medium" if raw_sim >= 0.10 else "low"
            results.append({
                "project_id": int(row["project_id"]),
                "project_name": row["project_name"],
                "description": row["description"],
                "tech_stack": [s.strip() for s in row["tech_stack"].split(";")],
                "difficulty": row["difficulty"].capitalize(),
                "github_link": row["github_link"],
                "score": round(float(scores[i]), 4),
                "reason": self._generate_reason(skills, interests, row),
                "missing_skills": self._detect_skill_gaps(skills, row["tech_stack"]),
                "confidence": confidence,
            })

        return results

    def get_all_skills(self) -> list[str]:
        """Return sorted list of unique skills from the tech_stack column."""
        skills: set[str] = set()
        for cell in self.df["tech_stack"]:
            for s in cell.split(";"):
                s = s.strip()
                if s:
                    skills.add(s)
        return sorted(skills)

    def get_all_interests(self) -> list[str]:
        """Return sorted list of unique interests from the tags column."""
        interests: set[str] = set()
        for cell in self.df["tags"]:
            for t in cell.split(";"):
                t = t.strip()
                if t:
                    interests.add(t)
        return sorted(interests)

    def get_similar(self, project_id: int, top_n: int = 4) -> list[dict]:
        """Return the top_n most similar projects by TF-IDF cosine similarity."""
        row = self.df[self.df["project_id"] == project_id]
        if row.empty:
            return []
        row = row.iloc[0]
        project_vec = self.tfidf_matrix[row.name]
        sims = cosine_similarity(project_vec, self.tfidf_matrix).flatten()
        sims[row.name] = -1  # exclude the source project
        top_idx = sims.argsort()[::-1][:top_n]
        return [
            {
                "project_id": int(self.df.iloc[i]["project_id"]),
                "project_name": self.df.iloc[i]["project_name"],
                "description": self.df.iloc[i]["description"],
                "difficulty": self.df.iloc[i]["difficulty"].capitalize(),
                "tech_stack": [s.strip() for s in self.df.iloc[i]["tech_stack"].split(";")],
                "github_link": self.df.iloc[i]["github_link"],
                "score": round(float(sims[i]), 4),
            }
            for i in top_idx
        ]

    def get_next_projects(self, completed_id: int, level: str) -> list[dict]:
        """Suggest progression projects — same or one level harder."""
        row = self.df[self.df["project_id"] == completed_id]
        if row.empty:
            return []

        row = row.iloc[0]
        current = DIFFICULTY_LEVELS.get(row["difficulty"], 1)
        allowed = {k for k, v in DIFFICULTY_LEVELS.items() if v in (current, current + 1)}

        candidates = self.df[
            (self.df["difficulty"].isin(allowed))
            & (self.df["project_id"] != completed_id)
        ]
        if candidates.empty:
            return []

        project_vec = self.tfidf_matrix[row.name]
        cand_tfidf = self.tfidf_matrix[candidates.index.tolist()]
        sims = cosine_similarity(project_vec, cand_tfidf).flatten()
        top_idx = sims.argsort()[::-1][:3]

        return [
            {
                "project_id": int(candidates.iloc[i]["project_id"]),
                "project_name": candidates.iloc[i]["project_name"],
                "description": candidates.iloc[i]["description"],
                "difficulty": candidates.iloc[i]["difficulty"].capitalize(),
                "tech_stack": [s.strip() for s in candidates.iloc[i]["tech_stack"].split(";")],
            }
            for i in top_idx
        ]
