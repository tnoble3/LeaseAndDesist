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
  updateChallenge,
  updateGoal,
  deleteChallenge,
  deleteGoal,
  setChallengeRsvp,
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
  const showSentryTest = import.meta.env.DEV;
  const [tokenVersion, setTokenVersion] = useState(0);
  const [currentUser, setCurrentUser] = useState(() => readStoredUser());
  const [activeView, setActiveView] = useState("home");

  const [goals, setGoals] = useState([]);
  const [goalLoading, setGoalLoading] = useState(true);
  const [goalError, setGoalError] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [completionSelection, setCompletionSelection] = useState([]);

  const [challenges, setChallenges] = useState([]);
  const [challengeFilter, setChallengeFilter] = useState("all");
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challengeError, setChallengeError] = useState("");
  const [recentChallenges, setRecentChallenges] = useState([]);
  const [rsvpMap, setRsvpMap] = useState({});

  const [auraPosition, setAuraPosition] = useState({ x: 50, y: 50 });

  const hasToken = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.localStorage.getItem("demo_jwt"));
  }, [tokenVersion]);

  const goalProgress = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((goal) => goal.status === "completed").length;
    const percentage = total ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  }, [goals]);

  const displayName = useMemo(() => {
    if (!currentUser) return "";
    const combined = [currentUser.firstName, currentUser.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return combined || currentUser.username || "";
  }, [currentUser]);

  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const greetingLine = useMemo(
    () => `${timeGreeting}${displayName ? ', ' : ''}`,
    [timeGreeting]
  );

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
      let targetGoalId =
        typeof goalId === "undefined"
          ? challengeFilter === "all"
            ? null
            : challengeFilter
          : goalId;

      if (targetGoalId === "all") {
        targetGoalId = null;
      }

      setChallengeLoading(true);
      try {
        const params = targetGoalId ? { goalId: targetGoalId } : {};
        const data = await fetchChallenges(params);

        const nextRsvps = {};
        data.forEach((item) => {
          if (item.userRsvp) {
            nextRsvps[item._id] = item.userRsvp;
          }
        });
        setRsvpMap((prev) => ({ ...prev, ...nextRsvps }));

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
    [hasToken, selectedGoalId, challengeFilter]
  );

  const loadRecentChallenges = useCallback(async () => {
    if (!hasToken) {
      setRecentChallenges([]);
      return;
    }
    try {
      const data = await fetchChallenges({ limit: 4 });
      const nextRsvps = {};
      data.forEach((item) => {
        if (item.userRsvp) {
          nextRsvps[item._id] = item.userRsvp;
        }
      });
      setRsvpMap((prev) => ({ ...prev, ...nextRsvps }));
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
  }, [loadChallenges, tokenVersion]);

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
    setCompletionSelection([]);
    setChallengeFilter("all");
    setRsvpMap({});
    setActiveView("home");
  };

  const handleGoalCreated = async () => {
    await loadGoals();
  };

  const handleGoalDeleted = async (goalId) => {
    await deleteGoal(goalId);
    setSelectedGoalId((prev) => (prev === goalId ? "" : prev));
    setChallengeFilter((prev) => (prev === goalId ? "all" : prev));
    setCompletionSelection((prev) => prev.filter((id) => id !== goalId));
    setChallenges([]);
    await loadGoals();
    await loadRecentChallenges();
  };

  const handleChallengeCreated = async (goalId) => {
    await loadChallenges(goalId);
    await loadRecentChallenges();
  };

  const handleChallengeStatus = async (challenge, status) => {
    if (status === "delete") {
      await deleteChallenge(challenge._id);
    } else {
      await updateChallenge(challenge._id, { status });
    }
    await loadChallenges(challenge.goal);
    await loadRecentChallenges();
  };

  const handleRsvp = async (challengeId, status) => {
    const { rsvpCounts } = await setChallengeRsvp(challengeId, status);

    setRsvpMap((prev) => {
      const next = { ...prev };
      if (status === "none") {
        delete next[challengeId];
      } else {
        next[challengeId] = status;
      }
      return next;
    });

    const applyCounts = (listUpdater) =>
      listUpdater((prev) =>
        prev.map((item) =>
          item._id === challengeId
            ? {
                ...item,
                userRsvp: status === "none" ? null : status,
                rsvpCounts: rsvpCounts ?? item.rsvpCounts,
              }
            : item
        )
      );

    if (rsvpCounts) {
      applyCounts(setChallenges);
      applyCounts(setRecentChallenges);
    } else {
      setChallenges((prev) =>
        prev.map((item) =>
          item._id === challengeId ? { ...item, userRsvp: status } : item
        )
      );
      setRecentChallenges((prev) =>
        prev.map((item) =>
          item._id === challengeId ? { ...item, userRsvp: status } : item
        )
      );
    }
  };

  const upcomingEvents = useMemo(
    () => recentChallenges.filter((challenge) => challenge.status !== "done"),
    [recentChallenges]
  );

  const handleAuraMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setAuraPosition({ x, y });
  };

  const handleNavigate = (nextView) => {
    setActiveView(nextView);
  };

  const handleChallengeFilterChange = (nextValue) => {
    setChallengeFilter(nextValue);
    const goalId = nextValue === "all" ? null : nextValue;
    loadChallenges(goalId);
  };

  const toggleGoalCompletionSelection = (goalId) => {
    setCompletionSelection((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const markSelectedGoalsComplete = async () => {
    if (!completionSelection.length) return;
    await Promise.all(
      completionSelection.map((goalId) =>
        updateGoal(goalId, { status: "completed" })
      )
    );
    setCompletionSelection([]);
    await loadGoals();
    if (selectedGoalId) {
      await loadChallenges(selectedGoalId);
    }
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
        onProfileUpdate={(nextUser) => {
          setCurrentUser(nextUser);
        }}
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
                  <p
                    className="eyebrow typewriter"
                    style={{
                      "--typewriter-width": `${Math.max(
                        greetingLine.length + 2,
                        12
                      )}ch`,
                    }}
                  >
                    {greetingLine}
                  </p>
                  <h1>
                    {displayName
                      ? `${displayName}`
                      : "Plan your next milestone"}
                  </h1>
                  <p className="muted">
                  Interact with your community.
                  </p>
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
                    {upcomingEvents.length ? (
                      upcomingEvents.map((challenge) => {
                        const rsvpStatus = rsvpMap[challenge._id] || "none";
                        const rsvpCounts =
                          challenge.user === currentUser?.id
                            ? challenge.rsvpCounts
                            : undefined;
                        return (
                        <li key={challenge._id}>
                          <div>
                            <strong>{challenge.title}</strong>
                            {challenge.description && <p>{challenge.description}</p>}
                            {rsvpCounts && (
                              <p className="muted">
                                RSVPs — Going: {rsvpCounts.going || 0} · Maybe:{" "}
                                {rsvpCounts.maybe || 0} · Not going:{" "}
                                {rsvpCounts.declined || 0}
                              </p>
                            )}
                          </div>
                          <div className="mini-list__actions">
                            <span className={`status ${challenge.status}`}>
                              {formatChallengeStatus(challenge.status)}
                            </span>
                            <div className="rsvp-group" aria-label="RSVP">
                              {["going", "maybe", "declined"].map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  className={`rsvp-pill ${
                                    rsvpStatus === option ? "active" : ""
                                  }`}
                                  onClick={() => handleRsvp(challenge._id, option)}
                                >
                                  {option === "going"
                                    ? "Going"
                                    : option === "maybe"
                                    ? "Maybe"
                                    : "Not going"}
                                </button>
                              ))}
                            </div>
                          </div>
                        </li>
                        );
                      })
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
                  loading={goalLoading}
                  error={goalError}
                />
              </section>
              <section className="view-section">
                <div className="card filter-bar">
                  <div>
                    <p className="eyebrow">Completion</p>
                    <h3>Select goals to mark complete</h3>
                    <p className="muted">
                      Choose multiple goals to mark them finished in one click.
                    </p>
                  </div>
                <div className="goal-complete-actions">
                  <span className="muted small">
                    Selected: {completionSelection.length}
                  </span>
                  <button
                    type="button"
                    className="mark-complete-btn"
                    onClick={markSelectedGoalsComplete}
                    disabled={!completionSelection.length}
                  >
                    Mark completed
                  </button>
                  </div>
                </div>
              </section>
              <section className="view-section">
                <GoalList
                  goals={goals}
                  loading={goalLoading}
                  error={goalError}
                  selectedGoalId={selectedGoalId}
                  onSelect={(id) => {
                    setSelectedGoalId(id);
                    setChallengeFilter(id);
                    loadChallenges(id);
                  }}
                  onDelete={handleGoalDeleted}
                  completionSelection={completionSelection}
                  onToggleCompletion={toggleGoalCompletionSelection}
                  currentUserId={currentUser?.id}
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
                <div className="card filter-bar">
                  <div>
                    <p className="eyebrow">Filter</p>
                    <h3>Show events for</h3>
                  </div>
                  <select
                    value={challengeFilter}
                    onChange={(event) => handleChallengeFilterChange(event.target.value)}
                  >
                    <option value="all">All events</option>
                    {goals.map((goal) => (
                      <option key={goal._id} value={goal._id}>
                        {goal.title}
                      </option>
                    ))}
                  </select>
                </div>
              </section>
              <section className="view-section">
                <ChallengeList
                  challenges={challenges}
                  loading={challengeLoading}
                  error={challengeError}
                  onStatusChange={handleChallengeStatus}
                  onDelete={(challenge) => handleChallengeStatus(challenge, "delete")}
                  onRsvp={handleRsvp}
                  rsvpMap={rsvpMap}
                  currentUserId={currentUser?.id}
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
        {showSentryTest && (
          <button
            type="button"
            className="sr-only"
            aria-label="Trigger Sentry frontend test error"
            onClick={triggerFrontendError}
          >
            Test Sentry error
          </button>
        )}
      </div>
    </div>
  );
};

export default App;
