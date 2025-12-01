import { useEffect, useMemo, useState } from "react";
import { submitForFeedback } from "../api/goalService.js";

const AiFeedbackForm = ({ goals = [], selectedGoalId }) => {
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const selectedGoal = useMemo(
    () => goals.find((goal) => goal._id === selectedGoalId),
    [goals, selectedGoalId]
  );

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName("");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setContent((prev) => {
        const text = reader.result?.toString() || "";
        return prev ? `${prev}\n\n${text}` : text;
      });
    };
    reader.readAsText(file);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");
    setFeedback("");

    if (!content.trim()) {
      setError("Please add text or upload a file.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        content,
        fileName,
      };
      if (selectedGoalId) {
        payload.goalId = selectedGoalId;
      }

      const response = await submitForFeedback(payload);
      setFeedback(response.feedback);
      setStatus("Feedback ready");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Unable to submit for feedback right now.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setStatus("");
    setFeedback("");
    setError("");
  }, [selectedGoalId]);

  return (
    <section className="card feedback-card">
      <header className="feedback-card__header">
        <div>
          <p className="eyebrow">AI Feedback</p>
          <h3>Review my post or petition</h3>
          <p className="muted">
            {selectedGoal
              ? `We will tailor feedback to "${selectedGoal.title}".`
              : "Paste your draft post, petition, or announcement, or upload a text file."}
          </p>
        </div>
        <label className="file-pill">
          <input type="file" accept=".txt,.md,.json" onChange={handleFile} />
          {fileName ? `Attached: ${fileName}` : "Attach text file"}
        </label>
      </header>

      <form className="goal-form" onSubmit={onSubmit}>
        <label>
          Work to review<span className="required">*</span>
          <textarea
            rows="6"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your draft post, petition, or announcement..."
          />
        </label>

        {status && <div className="info-banner">{status}</div>}
        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Request feedback"}
        </button>
      </form>

      {feedback && (
        <div className="feedback-result">
          <p className="eyebrow">AI response</p>
          <p>{feedback}</p>
        </div>
      )}
    </section>
  );
};

export default AiFeedbackForm;
