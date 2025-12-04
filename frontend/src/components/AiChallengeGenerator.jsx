import { useEffect, useMemo, useState } from "react";
import { generateAiChallenge } from "../api/goalService.js";

const OCCASION_OPTIONS = [
  { value: "none", label: "Any/No occasion" },
  { value: "christmas", label: "Christmas" },
  { value: "halloween", label: "Halloween" },
  { value: "valentines day", label: "Valentine's Day" },
  { value: "easter", label: "Easter" },
  { value: "graduation", label: "Graduation" },
  { value: "thanksgiving", label: "Thanksgiving" },
];

const formatOccasionLabel = (value) =>
  OCCASION_OPTIONS.find((option) => option.value === value)?.label || value;

const AiChallengeGenerator = ({ goals = [], selectedGoalId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [goalContext, setGoalContext] = useState(selectedGoalId || "none");
  const [occasion, setOccasion] = useState("none");
  const [focusInput, setFocusInput] = useState("");

  const selectedGoal = useMemo(
    () => goals.find((goal) => goal._id === goalContext),
    [goals, goalContext]
  );

  useEffect(() => {
    if (goalContext === "none") return;
    const exists = goals.some((goal) => goal._id === goalContext);
    if (!exists) {
      setGoalContext(selectedGoalId || "none");
    }
  }, [goalContext, goals, selectedGoalId]);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {};
      const focus = focusInput.trim();

      if (goalContext !== "none") {
        payload.goalId = goalContext;
        if (selectedGoal?.title && !focus) {
          payload.focus = selectedGoal.title;
        }
      }
      if (occasion !== "none") {
        payload.occasion = occasion;
      }
      if (focus) {
        payload.focus = focus;
      }

      const data = await generateAiChallenge(payload);
      setSuggestion({
        title: data.title,
        description: data.description,
        goalId: data.goalId || payload.goalId || "",
        focus: data.focus || payload.focus || "",
        occasion: data.occasion || payload.occasion || "",
      });
      setIsOpen(true);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Unable to generate a community event right now.";
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
          <h3>Generate a community event</h3>
          <p className="muted">
            {selectedGoal
              ? `Pick a goal or stay independent, then add an occasion to theme the event around.`
              : "Choose a goal (or none) and an occasion to craft a neighbor-friendly event idea."}
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

      <div className="ai-card__filters">
        <label htmlFor="goal-context">
          <span>Goal context</span>
          <select
            id="goal-context"
            value={goalContext}
            onChange={(event) => setGoalContext(event.target.value)}
            disabled={!goals.length && goalContext === "none"}
          >
            <option value="none">No goal (general community event)</option>
            {goals.map((goal) => (
              <option key={goal._id} value={goal._id}>
                {goal.title}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="focus">
          <span>Event theme (optional)</span>
          <input
            id="focus"
            type="text"
            value={focusInput}
            onChange={(event) => setFocusInput(event.target.value)}
            placeholder="e.g. resident welcome, pet meetup, garden workday"
          />
        </label>

        <label htmlFor="occasion">
          <span>Occasion</span>
          <select
            id="occasion"
            value={occasion}
            onChange={(event) => setOccasion(event.target.value)}
          >
            {OCCASION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      {isOpen && suggestion && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="AI generated community event"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal__header">
              <p className="eyebrow">AI community event</p>
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
              <p className="muted">Goal focus: "{suggestion.focus}".</p>
            )}
            {suggestion.occasion && (
              <p className="muted">
                Occasion: {formatOccasionLabel(suggestion.occasion)}.
              </p>
            )}
            {suggestion.description && <p>{suggestion.description}</p>}
          </div>
        </div>
      )}
    </section>
  );
};

export default AiChallengeGenerator;
