import { useState } from "react";
import { useForm } from "react-hook-form";
import { submitForFeedback } from "../api/goalService.js";

const AIFeedbackForm = ({ onSubmitted }) => {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { submission: "" } });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState("");

  const onSubmit = async (values) => {
    setLoading(true); setError(""); setFeedback(null);
    try {
      const res = await submitForFeedback({ submission: values.submission });
      setFeedback(res.feedback || res);
      onSubmitted?.();
      reset();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to get feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card form-card">
      <h3>Submit for AI Feedback</h3>
      <form className="goal-form" onSubmit={handleSubmit(onSubmit)}>
        <label>
          Submission<span className="required">*</span>
          <textarea rows="5" {...register("submission", { required: true })} />
        </label>
        <button type="submit" disabled={loading}>{loading ? "Reviewing…" : "Submit for feedback"}</button>
      </form>

      {error && <p className="error">{error}</p>}

      {feedback && (
        <div className="card" style={{ marginTop: "0.75rem" }}>
          <h4>AI Feedback</h4>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(feedback, null, 2)}</pre>
        </div>
      )}
    </section>
  );
};

export default AIFeedbackForm;
