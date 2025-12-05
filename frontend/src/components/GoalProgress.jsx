const GoalProgress = ({ progress, loading, error }) => {
  if (loading) {
    return (
      <section className="card">
        <p className="muted">Calculating progress…</p>
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

  if (!progress || progress.available === 0) {
    return (
      <section className="card">
        <p className="muted">Create a goal to start tracking progress.</p>
      </section>
    );
  }

  if (progress.total === 0) {
    return (
      <section className="card">
        <p className="muted">
          Select goals you wish to work toward, and your progress will be tracked here.
        </p>
      </section>
    );
  }

  const percentage = Math.min(Math.max(progress.percentage || 0, 0), 100);

  return (
    <section className="card progress-card">
      <header>
        <p className="eyebrow">Your progress</p>
        <h3>{percentage}% complete</h3>
      </header>
      <p className="muted">
        {progress.completed}/{progress.total} goals finished
      </p>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
    </section>
  );
};

export default GoalProgress;
