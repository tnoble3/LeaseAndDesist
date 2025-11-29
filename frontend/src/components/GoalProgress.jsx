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

  if (!progress) {
    return (
      <section className="card">
        <p className="muted">Select a goal to view progress.</p>
      </section>
    );
  }

  return (
    <section className="card progress-card">
      <header>
        <p className="eyebrow">Progress</p>
        <h3>{progress.percentage || 0}% complete</h3>
      </header>
      <p className="muted">
        {progress.completed}/{progress.total} challenges finished
      </p>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress.percentage || 0}%` }}
        />
      </div>
    </section>
  );
};

export default GoalProgress;
