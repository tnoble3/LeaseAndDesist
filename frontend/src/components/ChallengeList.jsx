import { formatChallengeStatus } from "../utils/statusLabels.js";

const ChallengeList = ({
  challenges = [],
  loading,
  error,
  onStatusChange,
  onDelete,
  onRsvp,
  rsvpMap = {},
  currentUserId,
}) => {
  if (loading) {
    return (
      <section className="card">
        <p className="muted">Loading events...</p>
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
        <p className="muted">No events yet.</p>
      </section>
    );
  }

  return (
    <section className="challenge-grid">
      {challenges.map((challenge) => {
        const isOwner =
          challenge.user?.toString?.() === currentUserId ||
          challenge.user === currentUserId;

        return (
          <article className="card challenge-card" key={challenge._id}>
            <header>
              <h3>{challenge.title}</h3>
              <span className={`status ${challenge.status}`}>
                {formatChallengeStatus(challenge.status)}
              </span>
            </header>
            {challenge.description && <p>{challenge.description}</p>}
            {challenge.rsvpCounts && isOwner && (
              <p className="muted">
                RSVPs — Going: {challenge.rsvpCounts.going || 0} · Maybe:{" "}
                {challenge.rsvpCounts.maybe || 0} · Not going:{" "}
                {challenge.rsvpCounts.declined || 0}
              </p>
            )}
            {onRsvp && (
              <div className="rsvp-group" aria-label="RSVP">
                {["going", "maybe", "declined"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`rsvp-pill ${rsvpMap[challenge._id] === option ? "active" : ""}`}
                    onClick={() => onRsvp(challenge._id, option)}
                  >
                    {option === "going"
                      ? "Going"
                      : option === "maybe"
                      ? "Maybe"
                      : "Not going"}
                  </button>
                ))}
              </div>
            )}
            {isOwner ? (
              <div className="challenge-actions">
                <button
                  type="button"
                  className="ghost"
                  onClick={() => onStatusChange(challenge, "in_progress")}
                >
                  In Progress
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
            ) : (
              <p className="muted small">Only the event creator can update or delete.</p>
            )}
          </article>
        );
      })}
    </section>
  );
};

export default ChallengeList;
