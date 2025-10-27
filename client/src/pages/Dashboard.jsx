import { Link } from 'react-router-dom';

function Dashboard({ auth }) {
  const email = auth?.user?.email;

  return (
    <div className="page dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Welcome back{email ? `, ${email}` : ''} 👋</h1>
          <p className="muted">
            Your renter hub for goals, challenges, and lease updates.
          </p>
        </div>
        <Link to="/" className="secondary-button">Back to home</Link>
      </header>

      <section className="dashboard-section">
        <h2>Goals</h2>
        <p className="muted">Track leasing milestones and roommate tasks here.</p>
        <div className="placeholder-card">
          <p>Coming soon: goal list and progress tracking.</p>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Challenges</h2>
        <p className="muted">Share and solve renter problems with your community.</p>
        <div className="placeholder-card">
          <p>Coming soon: community challenges and discussion threads.</p>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Announcements</h2>
        <div className="placeholder-card">
          <p>Stay tuned for system updates and lease reminders.</p>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
