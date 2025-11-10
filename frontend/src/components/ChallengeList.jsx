const ChallengeList = ({
  challenges = [],
  loading,
  error,
  onStatusChange,
  onDelete,
}) => {
  if (loading) {
    return (
      <section className="card">
        <p className="muted">Loading challenges…</p>
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

  if (!challenges.length) {
    return (
      <section className="card">
        <p className="muted">No challenges yet.</p>
      </section>
    );
  }

  return (
    <section className="challenge-grid">
      {challenges.map((challenge) => (
        <article className="card challenge-card" key={challenge._id}>
          <header>
            <h3>{challenge.title}</h3>
            <span className={`status ${challenge.status}`}>{challenge.status}</span>
          </header>
          {challenge.description && <p>{challenge.description}</p>}
          <div className="challenge-actions">
            <button
              type="button"
              className="ghost"
              onClick={() => onStatusChange(challenge, "in_progress")}
            >
              In progress
            </button>
            <button
              type="button"
              onClick={() => onStatusChange(challenge, "done")}
            >
              Complete
            </button>
            <button
              type="button"
              className="ghost danger"
              onClick={() => onDelete(challenge)}
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </section>
  );
};

export default ChallengeList;
