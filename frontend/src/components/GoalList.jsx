import { formatGoalStatus } from "../utils/statusLabels.js";

const GoalList = ({ goals = [], loading, error, selectedGoalId, onSelect }) => {
  if (loading) {
    return (
      <section className="card">
        <p className="muted">Loading goals…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card">
        <p className="error">{error}</p>
      </section>
    );
  }

  if (!goals.length) {
    return (
      <section className="card">
        <p className="muted">No goals yet. Create one to get started.</p>
      </section>
    );
  }

  return (
    <section className="goal-grid">
      {goals.map((goal) => {
        const isSelected = goal._id === selectedGoalId;
        return (
          <article
            className={`goal-card card ${isSelected ? "is-selected" : ""}`}
            key={goal._id}
          >
            <header>
              <h3>{goal.title}</h3>
              <span className={`status ${goal.status}`}>
                {formatGoalStatus(goal.status)}
              </span>
            </header>
            {goal.description && <p className="muted">{goal.description}</p>}
            <button type="button" className="ghost" onClick={() => onSelect(goal._id)}>
              {isSelected ? "Selected" : "Focus"}
            </button>
          </article>
        );
      })}
    </section>
  );
};

export default GoalList;
