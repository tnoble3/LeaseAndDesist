import React from 'react'
import ProgressBar from '../components/ProgressBar'
import { useChallenges } from '../context/ChallengesContext'

export default function Dashboard(){
  const { challenges, loading } = useChallenges()
  const total = challenges.length
  const completed = challenges.filter(c=>c.completed).length
  const percent = total ? Math.round((completed / total) * 100) : 0

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="card" data-testid="dashboard-progress">
        <h3>Progress</h3>
        {loading ? <p>Loading...</p> : <p data-testid="progress-text">{completed} / {total} challenges complete</p>}
        <ProgressBar percent={percent} />
      </div>
    </div>
  )
}
