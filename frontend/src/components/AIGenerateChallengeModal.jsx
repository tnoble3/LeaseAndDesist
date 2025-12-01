import { useState } from "react";
import axios from "axios";
import "../styles/AIModal.css";

const AIGenerateChallengeModal = ({ isOpen, onClose, onChallengeGenerated }) => {
  const [difficulty, setDifficulty] = useState("medium");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedChallenge, setGeneratedChallenge] = useState(null);

  const handleGenerateChallenge = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/ai/generateChallenge`,
        {
          difficulty,
          topic: topic || "general programming",
          language,
        }
      );

      if (response.data.success) {
        setGeneratedChallenge(response.data.challenge);
      } else {
        setError(response.data.error || "Failed to generate challenge");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error generating challenge");
      console.error("Challenge generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseChallenge = () => {
    if (generatedChallenge && onChallengeGenerated) {
      onChallengeGenerated(generatedChallenge);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>🤖 Generate Challenge with AI</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </header>

        {!generatedChallenge ? (
          <form onSubmit={handleGenerateChallenge} className="challenge-form">
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty Level</label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="topic">Topic</label>
              <input
                id="topic"
                type="text"
                placeholder="e.g., array manipulation, data structures"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="language">Programming Language</label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className={loading ? "loading" : ""}
            >
              {loading ? "Generating..." : "Generate Challenge"}
            </button>
          </form>
        ) : (
          <div className="challenge-preview">
            <h3>{generatedChallenge.title}</h3>
            <p className="challenge-description">
              {generatedChallenge.description}
            </p>

            {generatedChallenge.examples && generatedChallenge.examples.length > 0 && (
              <div className="challenge-section">
                <h4>Examples</h4>
                <ul>
                  {generatedChallenge.examples.map((example, idx) => (
                    <li key={idx}>{example}</li>
                  ))}
                </ul>
              </div>
            )}

            {generatedChallenge.hints && generatedChallenge.hints.length > 0 && (
              <div className="challenge-section">
                <h4>💡 Hints</h4>
                <ul>
                  {generatedChallenge.hints.map((hint, idx) => (
                    <li key={idx}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}

            {generatedChallenge.approach && (
              <div className="challenge-section">
                <h4>Approach</h4>
                <p>{generatedChallenge.approach}</p>
              </div>
            )}

            <div className="modal-actions">
              <button className="secondary" onClick={() => setGeneratedChallenge(null)}>
                Generate Another
              </button>
              <button onClick={handleUseChallenge}>Use This Challenge</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIGenerateChallengeModal;
