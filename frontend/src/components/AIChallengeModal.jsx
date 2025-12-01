import { useState } from "react";
import { generateChallenge } from "../api/goalService.js";

const AIChallengeModal = ({ onClose, onCreated }) => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await generateChallenge({ topic: topic || "general", difficulty });
      setResult(res.generated || res);
      onCreated?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ width: "min(720px, 95%)", margin: "1rem auto", position: "relative" }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>AI: Generate Challenge</h3>
        <button className="ghost" onClick={onClose}>Close</button>
      </header>

      <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
        <label>
          Topic
          <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. async/await" />
        </label>

        <label>
          Difficulty
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>

        <div>
          <button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating…" : "Generate challenge"}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {result && (
          <div className="card" style={{ marginTop: "0.5rem" }}>
            <h4>{result.title}</h4>
            <p>{result.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChallengeModal;
