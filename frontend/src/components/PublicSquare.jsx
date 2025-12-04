const placeholderThreads = [
  {
    id: "maintenance",
    title: "Maintenance updates",
    participants: ["Cassidy", "Jolie", "Abby", "Trinity"],
    snippet: "Quick updates on fixes, noise windows, and timelines.",
    tag: "Pinned",
  },
  {
    id: "amenities",
    title: "Amenities chat",
    participants: ["Will", "Mike", "Dustin"],
    snippet: "Pool hours, gym etiquette, and booking the lounge.",
    tag: "Open",
  },
  {
    id: "events",
    title: "Events comittee chat",
    participants: ["Steve", "Hopper"],
    snippet: "Plan upcoming community events.",
    tag: "Quiet",
  },
];

const placeholderMessages = [
  {
    id: 1,
    author: "Cassidy",
    role: "Manager",
    time: "09:20 AM",
    body:
      "Hey everyone! Contractor will be in the lobby at 2pm. Let me know if anyone has any questions.",
  },
  {
    id: 2,
    author: "Abby",
    role: "Neighbor",
    time: "09:27 AM",
    body:
      "Thanks for the heads up! Also: does anyone know if we can store bikes in stair well?",
  },
  {
    id: 3,
    author: "Jolie",
    role: "Supervisor",
    time: "09:35 AM",
    body:
      "No sadly, we don't want any accidents or thefts; I can add a sign to keep the path clear.",
  },
];

const PublicSquare = ({ currentUserName = "You" }) => {
  const activeThread = placeholderThreads[0];

  return (
    <div className="view-stack">
      <section className="card square-header">
        <div>
          <p className="eyebrow">Public Square</p>
          <h2>Open chat between your renting community</h2>
          <p className="muted">
            Drop quick updates, coordinate events, and keep everyone in the loop. This is a
            skeleton view of what the chat page would look like in the future.
          </p>
        </div>
      </section>

      <section className="view-section public-square">
        <div className="card public-square__sidebar">
          <div>
            <p className="eyebrow">Squares</p>
            <h3>Pick a conversation</h3>
            <p className="muted small">
              Keep it organized with named squares. Badges are placeholders for future status.
            </p>
          </div>
          <ul className="public-square__thread-list">
            {placeholderThreads.map((thread) => (
              <li key={thread.id} className="public-square__thread">
                <div className="public-square__thread-top">
                  <div>
                    <strong>{thread.title}</strong>
                    <p className="muted small">
                      {thread.participants.join(" · ")}
                    </p>
                  </div>
                  <span className="public-square__pill">{thread.tag}</span>
                </div>
                <p className="public-square__thread-snippet">{thread.snippet}</p>
              </li>
            ))}
          </ul>
          <div className="public-square__sidebar-actions">
            <button type="button" className="ghost" disabled>
              Start new square (coming soon)
            </button>
            <button type="button" className="ghost" disabled>
              Invite a neighbor
            </button>
          </div>
        </div>

        <div className="card public-square__chat">
          <header className="public-square__chat-header">
            <div>
              <p className="eyebrow">Now chatting</p>
              <h3>{activeThread.title}</h3>
              <p className="muted small">
                {activeThread.participants.join(" · ")}
              </p>
            </div>
            <div className="public-square__chat-actions">
              <button type="button" className="ghost" disabled>
                Pin update
              </button>
              <button type="button" className="ghost" disabled>
                Mark resolved
              </button>
            </div>
          </header>

          <div className="public-square__transcript" role="log" aria-live="polite">
            {placeholderMessages.map((message) => (
              <article key={message.id} className="public-square__message">
                <div className="public-square__avatar" aria-hidden="true">
                  {message.author[0]}
                </div>
                <div className="public-square__message-body">
                  <div className="public-square__message-meta">
                    <strong>{message.author}</strong>
                    <span className="public-square__pill subtle">{message.role}</span>
                    <span className="muted small">{message.time}</span>
                  </div>
                  <p>{message.body}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="public-square__composer">
            <div className="public-square__composer-meta">
              <div className="public-square__avatar small" aria-hidden="true">
                {currentUserName[0] || "Y"}
              </div>
              <div>
                <strong>{currentUserName}</strong>
                <p className="muted small">
                  Message composer placeholder, wire up input, send action, and delivery states.
                </p>
              </div>
            </div>
            <div className="public-square__composer-fields">
              <textarea
                rows={3}
                placeholder="Say hello to your neighbors..."
                disabled
              />
              <div className="public-square__composer-actions">
                <input type="text" placeholder="Add a quick note or attachment" disabled />
                <button type="button" disabled>
                  Send (disabled)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicSquare;
