import { useState } from "react";
import axios from "axios";
import "../styles/AIFeedbackForm.css";

const AIFeedbackSubmissionForm = ({ userId, isOpen, onClose, onFeedbackSubmitted }) => {
  const [submissionType, setSubmissionType] = useState("text");
  const [submissionContent, setSubmissionContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [feedbackId, setFeedbackId] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSubmissionContent(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmitForFeedback = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!submissionContent.trim()) {
      setError("Please provide code or content for feedback");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/ai/submitForFeedback`,
        {
          userId,
          submissionContent,
          submissionType,
          fileName,
        }
      );

      if (response.data.success) {
        setFeedback(response.data.feedback);
        setFeedbackId(response.data.feedbackId);
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted(response.data.feedbackId);
        }
      } else {
        setError(response.data.error || "Failed to get feedback");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error submitting for feedback");
      console.error("Feedback submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmissionContent("");
    setFileName("");
    setFeedback(null);
    setFeedbackId(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content feedback-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>📝 Get AI Feedback on Your Code</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </header>

        {!feedback ? (
          <form onSubmit={handleSubmitForFeedback} className="feedback-form">
            <div className="form-group">
              <label>Submission Type</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="text"
                    checked={submissionType === "text"}
                    onChange={(e) => {
                      setSubmissionType(e.target.value);
                      setFileName("");
                    }}
                  />
                  Text Input
                </label>
                <label>
                  <input
                    type="radio"
                    value="file"
                    checked={submissionType === "file"}
                    onChange={(e) => setSubmissionType(e.target.value)}
                  />
                  File Upload
                </label>
              </div>
            </div>

            {submissionType === "text" ? (
              <div className="form-group">
                <label htmlFor="code-textarea">Paste Your Code</label>
                <textarea
                  id="code-textarea"
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Paste your code here..."
                  rows="12"
                />
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="file-input">Upload Code File</label>
                <input
                  id="file-input"
                  type="file"
                  accept=".js,.py,.java,.cpp,.ts,.txt"
                  onChange={handleFileUpload}
                />
                {fileName && <p className="file-name">📄 {fileName}</p>}
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              disabled={loading || !submissionContent.trim()}
              className={loading ? "loading" : ""}
            >
              {loading ? "Processing..." : "Get Feedback"}
            </button>
          </form>
        ) : (
          <div className="feedback-result">
            <h3>✨ AI Feedback</h3>
            <div className="feedback-content">
              {feedback.split("\n").map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <div className="feedback-metadata">
              <small>Feedback ID: {feedbackId}</small>
            </div>

            <div className="modal-actions">
              <button className="secondary" onClick={handleReset}>
                Submit Another
              </button>
              <button onClick={onClose}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIFeedbackSubmissionForm;
