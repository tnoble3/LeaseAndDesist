import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'

export default function Dashboard(){
  const { goals, challenges } = useAppData()
  const [mood, setMood] = useState('sunny')

  // compute overall progress (completed challenges / total)
  const completed = challenges.filter(c => c.completed).length
  const total = challenges.length
  const percent = total ? Math.round((completed/total)*100) : 0

  const activeGoals = useMemo(() => goals.length, [goals])
  const openChallenges = useMemo(() => challenges.filter(c => !c.completed).length, [challenges])

  return (
    <div className="dashboard">
      <div className="page-title">
        <div>
          <p className="eyebrow">Hi there</p>
          <h1>Dashboard</h1>
        </div>
        <div className="pill mood">
          <span className="dot" />
          Today feels
          <select value={mood} onChange={e=>setMood(e.target.value)}>
            <option value="sunny">sunny</option>
            <option value="breezy">breezy</option>
            <option value="focused">focused</option>
          </select>
        </div>
      </div>

      <section className="grid">
        <div className="card stat-card">
          <p className="eyebrow">Goals</p>
          <div className="stat-value">{activeGoals}</div>
          <p className="muted">active goals</p>
          <Link to="/goals" className="ghost-btn">View goals →</Link>
        </div>
        <div className="card stat-card">
          <p className="eyebrow">Challenges</p>
          <div className="stat-value">{openChallenges}</div>
          <p className="muted">open challenges</p>
          <Link to="/challenges" className="ghost-btn">Go to challenges →</Link>
        </div>
        <div className="card stat-card">
          <p className="eyebrow">Completion</p>
          <div className="progress" data-cy="dashboard-progress">
            <div className="progress-bar" style={{width: percent + '%'}} />
          </div>
          <div data-cy="dashboard-stats" className="muted">{percent}% complete ({completed}/{total || 0})</div>
          <div className="mini-badges">
            <span className="badge">Streak: 3 days</span>
            <span className="badge">Focus: {mood}</span>
          </div>
        </div>
      </section>

      <section className="card list-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Quick overview</p>
            <h3>Recent goals</h3>
          </div>
          <Link to="/goals" className="ghost-btn">Add goal</Link>
        </div>
        <ul className="list">
          {goals.map(g => <li key={g._id}>{g.title}</li>)}
          {goals.length === 0 && <li className="muted">No goals yet. Add your first one!</li>}
        </ul>
      </section>

      <section className="card list-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Momentum</p>
            <h3>Recent challenges</h3>
          </div>
          <Link to="/challenges" className="ghost-btn">Create challenge</Link>
        </div>
        <ul className="list">
          {challenges.slice(0,5).map(c => (
            <li key={c._id}>
              <div>
                <strong>{c.title}</strong>
                <div className="muted">{c.completed ? 'Completed' : 'In progress'}</div>
              </div>
              <span className={`pill tiny ${c.completed ? 'pill-success' : 'pill-warn'}`}>
                {c.completed ? 'Done' : 'Active'}
              </span>
            </li>
          ))}
          {challenges.length === 0 && <li className="muted">No challenges yet. Add one to get moving.</li>}
        </ul>
      </section>
    </div>
  )
}
