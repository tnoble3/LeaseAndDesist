import { formatGoalStatus } from "../utils/statusLabels.js";

const GoalList = ({
  goals = [],
  loading,
  error,
  selectedGoalId,
  onSelect,
  onDelete,
  completionSelection = [],
  onToggleCompletion,
  currentUserId,
  onEdit,
}) => {
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
            <header className="goal-card__header">
              <label className="goal-select">
                <input
                  type="checkbox"
                  checked={completionSelection.includes(goal._id)}
                  onChange={() => onToggleCompletion?.(goal._id)}
                />
                <span>Select</span>
              </label>
              <div className="goal-card__summary">
                <h3>{goal.title}</h3>
                <span className={`status ${goal.status}`}>
                  {formatGoalStatus(goal.status)}
                </span>
              </div>
            </header>
            {goal.description && <p className="muted">{goal.description}</p>}
            <div className="goal-card__actions">
              <button type="button" className="ghost" onClick={() => onSelect(goal._id)}>
                {isSelected ? "Selected" : "Focus"}
              </button>
              {onDelete && goal.user === currentUserId && (
                <button
                  type="button"
                  className="ghost danger"
                  onClick={() => onDelete(goal._id)}
                >
                  Delete
                </button>
              )}
              {onEdit && goal.user === currentUserId && (
                <button
                  type="button"
                  className="ghost"
                  onClick={() => onEdit(goal)}
                >
                  Edit
                </button>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
};

export default GoalList;
