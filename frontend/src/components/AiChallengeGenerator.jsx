import { useEffect, useMemo, useState } from "react";
import { generateAiChallenge } from "../api/goalService.js";

const AiChallengeGenerator = ({ goals = [], selectedGoalId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestion, setSuggestion] = useState(null);

  const selectedGoal = useMemo(
    () => goals.find((goal) => goal._id === selectedGoalId),
    [goals, selectedGoalId]
  );

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {};
      if (selectedGoalId) {
        payload.goalId = selectedGoalId;
      }
      if (selectedGoal?.title) {
        payload.focus = selectedGoal.title;
      }

      const data = await generateAiChallenge(payload);
      setSuggestion({
        title: data.title,
        description: data.description,
        goalId: data.goalId || selectedGoalId || "",
        focus: data.focus || selectedGoal?.title || payload.focus || "",
      });
      setIsOpen(true);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Unable to generate a challenge idea right now.";
      setError(message);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  return (
    <section className="card ai-card">
      <div className="ai-card__header">
        <div>
          <p className="eyebrow">Need inspiration?</p>
          <h3>Generate a community ask</h3>
          <p className="muted">
            {selectedGoal
              ? `We will tailor an idea for "${selectedGoal.title}".`
              : "We will propose a quick community challenge or event you can refine."}
          </p>
        </div>
        <button
          type="button"
          className="ai-card__cta"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "Thinking..." : "Generate with AI"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}

      {isOpen && suggestion && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="AI generated community request"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal__header">
              <p className="eyebrow">AI community suggestion</p>
              <button
                type="button"
                className="ghost"
                onClick={closeModal}
                aria-label="Close"
              >
                Close
              </button>
            </div>
            <h3>{suggestion.title}</h3>
            {suggestion.focus && (
              <p className="muted">We tailored this idea for "{suggestion.focus}".</p>
            )}
            {suggestion.description && <p>{suggestion.description}</p>}
          </div>
        </div>
      )}
    </section>
  );
};

export default AiChallengeGenerator;
