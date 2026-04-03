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
    ) -> list[dict]:
        """
        Pipeline:
        1. Filter by difficulty
        2. TF-IDF cosine similarity against user query
        3. Hybrid score = 0.7 * similarity + 0.3 * popularity
        4. Return top N with explanations and skill gaps
        """
        filtered = self._filter_by_difficulty(level)
        if filtered.empty:
            return []

        filtered_indices = filtered.index.tolist()
        filtered_tfidf = self.tfidf_matrix[filtered_indices]

        query = " ".join(skills + interests).lower()
        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, filtered_tfidf).flatten()

        popularity = filtered["popularity_score"].values
        scores = 0.7 * similarities + 0.3 * popularity

        top_idx = scores.argsort()[::-1][:top_n]

        results = []
        for i in top_idx:
            row = filtered.iloc[i]
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
            })

        return results

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
