import { Link } from 'react-router-dom';

function Dashboard({ auth }) {
  const email = auth?.user?.email;

  if (!auth?.user) {
    return (
      <div className="page dashboard-page">
        <h2>Sign in required</h2>
        <p className="muted">Log in to access your renter dashboard.</p>
        <Link to="/login" className="secondary-button">Log In</Link>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Welcome back{email ? `, ${email}` : ''} !</h1>
          <p className="muted">
            Your renter hub to keep you in the loop.
          </p>
        </div>
        <Link to="/" className="secondary-button">Back to home square</Link>
      </header>

      <section className="dashboard-section">
        <h2>Town Square</h2>
        <p className="muted">Chat with your renter community</p>
        <div className="placeholder-card">
          <p>Coming soon.</p>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Announcement Square</h2>
        <p className="muted">Find announcements based on your renter community here.</p>
        <div className="placeholder-card">
          <p>Coming soon.</p>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Anonymous Square</h2>
        <div className="placeholder-card">
          <p>Anonymously share your thoughts here.</p>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
