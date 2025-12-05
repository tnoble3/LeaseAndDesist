import { formatGoalStatus } from "../utils/statusLabels.js";

const GoalList = ({
  goals = [],
  loading,
  error,
  selectedGoalId,
  onSelect,
  onDelete,
  currentUserId,
  onEdit,
  userGoalState = {},
  onTogglePickUp,
  onToggleComplete,
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
        const personalState = userGoalState[goal._id] || {
          pickedUp: false,
          completed: false,
        };
        const isPickedUp = personalState.pickedUp;
        const isCompleted = personalState.completed;
        return (
          <article
            className={`goal-card card ${isSelected ? "is-selected" : ""}`}
            key={goal._id}
          >
            <header className="goal-card__header">
              <div className="goal-card__summary">
                <h3>{goal.title}</h3>
                <span className={`status ${goal.status}`}>
                  {formatGoalStatus(goal.status)}
                </span>
              </div>
              <div className="goal-card__summary goal-card__summary--personal">
                <span
                  className={`pill ${isPickedUp ? "pill--info" : "pill--ghost"}`}
                >
                  {isPickedUp ? "Selected" : "Not Selected"}
                </span>
                <span
                  className={`pill ${
                    isCompleted
                      ? "pill--success"
                      : isPickedUp
                      ? "pill--info"
                      : "pill--ghost"
                  }`}
                >
                  {isPickedUp
                    ? isCompleted
                      ? "My status: Completed"
                      : "My status: In progress"
                    : "My status: Not started"}
                </span>
              </div>
            </header>
            {goal.description && <p className="muted">{goal.description}</p>}
            <div className="goal-card__actions">
              <button
                type="button"
                className="ghost"
                onClick={() => onTogglePickUp?.(goal._id)}
              >
                {isPickedUp ? "Drop goal" : "Select goal"}
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => onToggleComplete?.(goal._id)}
                disabled={!isPickedUp}
              >
                {isCompleted ? "Mark as not done" : "Mark as done"}
              </button>
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
