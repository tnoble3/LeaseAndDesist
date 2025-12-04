import { useCallback, useEffect, useMemo, useState } from "react";
import * as Sentry from "@sentry/react";
import AuthGate from "./components/AuthGate.jsx";
import NavBar from "./components/NavBar.jsx";
import GoalForm from "./components/GoalForm.jsx";
import GoalList from "./components/GoalList.jsx";
import GoalProgress from "./components/GoalProgress.jsx";
import ChallengeForm from "./components/ChallengeForm.jsx";
import AiChallengeGenerator from "./components/AiChallengeGenerator.jsx";
import AiFeedbackForm from "./components/AiFeedbackForm.jsx";
import ChallengeList from "./components/ChallengeList.jsx";
import Aurora from "./components/Aurora.jsx";
import leaseAndDesistLogo from "./assets/leaseanddesistlogo.png";
import {
  formatChallengeStatus,
  formatGoalStatus,
} from "./utils/statusLabels.js";
import {
  fetchGoals,
  fetchChallenges,
  fetchGoalProgress,
  updateChallenge,
  deleteChallenge,
} from "./api/goalService.js";
import "./App.css";

const readStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("demo_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const App = () => {
  const [tokenVersion, setTokenVersion] = useState(0);
  const [currentUser, setCurrentUser] = useState(() => readStoredUser());
  const [activeView, setActiveView] = useState("home");

  const [goals, setGoals] = useState([]);
  const [goalLoading, setGoalLoading] = useState(true);
  const [goalError, setGoalError] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [goalProgress, setGoalProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState("");

  const [challenges, setChallenges] = useState([]);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challengeError, setChallengeError] = useState("");
  const [recentChallenges, setRecentChallenges] = useState([]);

  const [auraPosition, setAuraPosition] = useState({ x: 50, y: 50 });

  const hasToken = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.localStorage.getItem("demo_jwt"));
  }, [tokenVersion]);

  const displayName = useMemo(() => {
    if (!currentUser) return "";
    const combined = [currentUser.firstName, currentUser.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return combined || currentUser.username || "";
  }, [currentUser]);

  const loadGoals = useCallback(async () => {
    if (!hasToken) {
      setGoals([]);
      setGoalLoading(false);
      return;
    }

    setGoalLoading(true);
    try {
      const data = await fetchGoals();
      setGoals(data);
      setGoalError("");
      if (data.length && !selectedGoalId) {
        setSelectedGoalId(data[0]._id);
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || "Unable to load goals right now.";
      setGoalError(message);
    } finally {
      setGoalLoading(false);
    }
  }, [hasToken, selectedGoalId]);

  const loadChallenges = useCallback(
    async (goalId) => {
      if (!hasToken) {
        setChallenges([]);
        return;
      }
      const targetGoalId =
        typeof goalId === "undefined" ? selectedGoalId : goalId;

      setChallengeLoading(true);
      try {
        const params = targetGoalId ? { goalId: targetGoalId } : {};
        const data = await fetchChallenges(params);
        setChallenges(data);
        setChallengeError("");
      } catch (error) {
        const message =
          error?.response?.data?.message || "Unable to load challenges.";
        setChallengeError(message);
      } finally {
        setChallengeLoading(false);
      }
    },
    [hasToken, selectedGoalId]
  );

  const loadProgress = useCallback(
    async (goalId) => {
      if (!hasToken) {
        setGoalProgress(null);
        return;
      }
      const targetGoalId = goalId || selectedGoalId;
      if (!targetGoalId) {
        setGoalProgress(null);
        return;
      }
      setProgressLoading(true);
      try {
        const data = await fetchGoalProgress(targetGoalId);
        setGoalProgress(data);
        setProgressError("");
      } catch (error) {
        const message =
          error?.response?.data?.message || "Unable to load progress.";
        setProgressError(message);
      } finally {
        setProgressLoading(false);
      }
    },
    [hasToken, selectedGoalId]
  );

  const loadRecentChallenges = useCallback(async () => {
    if (!hasToken) {
      setRecentChallenges([]);
      return;
    }
    try {
      const data = await fetchChallenges({ limit: 4 });
      setRecentChallenges(data);
    } catch {
      setRecentChallenges([]);
    }
  }, [hasToken]);

  useEffect(() => {
    loadGoals();
    loadRecentChallenges();
  }, [loadGoals, loadRecentChallenges, tokenVersion]);

  useEffect(() => {
    loadChallenges();
    loadProgress();
  }, [loadChallenges, loadProgress, tokenVersion]);

  const handleAuthenticated = () => {
    setCurrentUser(readStoredUser());
    setTokenVersion((prev) => prev + 1);
    setActiveView("home");
  };

  const handleLogout = () => {
    window.localStorage.removeItem("demo_jwt");
    window.localStorage.removeItem("demo_user");
    setCurrentUser(null);
    setTokenVersion((prev) => prev + 1);
    setGoals([]);
    setChallenges([]);
    setRecentChallenges([]);
    setSelectedGoalId("");
    setActiveView("home");
  };

  const handleGoalCreated = async () => {
    await loadGoals();
  };

  const handleChallengeCreated = async (goalId) => {
    await loadChallenges(goalId);
    if (goalId) {
      await loadProgress(goalId);
    }
    await loadRecentChallenges();
  };

  const handleChallengeStatus = async (challenge, status) => {
    if (status === "delete") {
      await deleteChallenge(challenge._id);
    } else {
      await updateChallenge(challenge._id, { status });
    }
    await loadChallenges(challenge.goal);
    if (challenge.goal) {
      await loadProgress(challenge.goal);
    }
    await loadRecentChallenges();
  };

  const handleAuraMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setAuraPosition({ x, y });
  };

  const handleNavigate = (nextView) => {
    setActiveView(nextView);
  };

  const triggerFrontendError = () => {
    Sentry.captureException(new Error("Sentry frontend test error"));
  };

  const unauthenticatedView = (
    <main className="auth-shell">
      <div className="auth-card">
        <div className="auth-visual">
          <img
            src={leaseAndDesistLogo}
            alt="Lease and Desist brand artwork"
            className="auth-visual__image"
          />
          <div className="auth-visual__copy">
            <h1>Welcome to Lease and Desist</h1>
            <p className="muted">Your space, your people, your voice.</p>
          </div>
        </div>
        <div className="auth-panel-wrapper">
          <AuthGate onAuthenticated={handleAuthenticated} />
        </div>
      </div>
    </main>
  );

  const authenticatedView = (
    <>
      <NavBar
        user={currentUser}
        onLogout={handleLogout}
        activeView={activeView}
        onNavigate={handleNavigate}
      />
      <main className="app-shell">
        <div className="content">
          {activeView === "home" && (
            <>
              <section
                className="hero card landing-hero"
                onMouseMove={handleAuraMove}
              >
                <div
                  className="aura-layer"
                  style={{
                    "--aura-x": `${auraPosition.x}%`,
                    "--aura-y": `${auraPosition.y}%`,
                  }}
                />
                <div>
                  <p className="eyebrow">Welcome back</p>
                  <h1>
                    {displayName
                      ? `${displayName}`
                      : "Plan your next milestone"}
                  </h1>
                  <p className="muted">
                  Interact with your community.
                  </p>
                  <button
                    type="button"
                    className="ghost"
                    onClick={triggerFrontendError}
                  >
                    Test Sentry error
                  </button>
                </div>
              </section>

              <section className="highlights-grid">
                <article className="card highlight-card">
                  <header>
                    <p className="eyebrow">Community Goals</p>
                    <h3>Latest Goals</h3>
                  </header>
                  <ul className="mini-list">
                    {goals.slice(0, 3).map((goal) => (
                      <li key={goal._id}>
                        <div>
                          <strong>{goal.title}</strong>
                          {goal.description && <p>{goal.description}</p>}
                        </div>
                        <span className={`status ${goal.status}`}>
                          {formatGoalStatus(goal.status)}
                        </span>
                      </li>
                    ))}
                    {!goals.length && (
                      <p className="muted">Create your first goal to see it here.</p>
                    )}
                  </ul>
                </article>

                <article className="card highlight-card">
                  <header>
                    <p className="eyebrow">Community Events</p>
                    <h3>Upcoming Events</h3>
                  </header>
                  <ul className="mini-list">
                    {recentChallenges.length ? (
                      recentChallenges.map((challenge) => (
                        <li key={challenge._id}>
                          <div>
                            <strong>{challenge.title}</strong>
                            {challenge.description && <p>{challenge.description}</p>}
                          </div>
                          <span className={`status ${challenge.status}`}>
                            {formatChallengeStatus(challenge.status)}
                          </span>
                        </li>
                      ))
                    ) : (
                      <p className="muted">Upcoming events.</p>
                    )}
                  </ul>
                </article>
              </section>
            </>
          )}

          {activeView === "community" && (
            <div className="view-stack">
              <section className="card square-header">
                <div>
                  <p className="eyebrow">Community Square</p>
                  <h2>Community Goals</h2>
                  <p className="muted">
                    Set and track community goals to enhance your shared living experience.
                  </p>
                </div>
              </section>

              <section className="view-section two-columns">
                <GoalForm onCreated={handleGoalCreated} />
                <GoalProgress
                  progress={goalProgress}
                  loading={progressLoading}
                  error={progressError}
                />
              </section>
              <section className="view-section">
                <GoalList
                  goals={goals}
                  loading={goalLoading}
                  error={goalError}
                  selectedGoalId={selectedGoalId}
                  onSelect={(id) => {
                    setSelectedGoalId(id);
                    loadChallenges(id);
                    loadProgress(id);
                  }}
                />
              </section>
            </div>
          )}

          {activeView === "events" && (
            <div className="view-stack">
              <section className="card square-header">
                <div>
                  <p className="eyebrow">Event Square</p>
                  <h2>Events & Challenges</h2>
                  <p className="muted">
                    Post requests for community events, challenges or activities to engage your neighbors.
                  </p>
                </div>
              </section>
              <section className="view-section two-columns">
                <ChallengeForm
                  goals={goals}
                  selectedGoalId={selectedGoalId}
                  onCreated={handleChallengeCreated}
                />
                <AiChallengeGenerator
                  goals={goals}
                  selectedGoalId={selectedGoalId}
                />
              </section>
              <section className="view-section">
                <AiFeedbackForm goals={goals} selectedGoalId={selectedGoalId} />
              </section>
              <section className="view-section">
                <ChallengeList
                  challenges={challenges}
                  loading={challengeLoading}
                  error={challengeError}
                  onStatusChange={handleChallengeStatus}
                  onDelete={(challenge) => handleChallengeStatus(challenge, "delete")}
                />
              </section>
            </div>
          )}
        </div>
      </main>
    </>
  );

  return (
    <div
      className={`app-frame ${
        hasToken ? "app-frame--dashboard" : "app-frame--auth"
      }`}
    >
      {hasToken && (
        <Aurora
          className="aurora-background"
          colorStops={["#B6E47C", "#F868E9", "#1F48FF"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      )}
      <div className="app-frame__content">
        {hasToken ? authenticatedView : unauthenticatedView}
      </div>
    </div>
  );
};

export default App;
