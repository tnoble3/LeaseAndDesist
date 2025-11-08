import React from 'react'

export default function GoalCard({ goal, onToggleComplete, onDelete }){
  return (
    <div className="card" data-testid={`goal-${goal._id}`}>
      <h3 data-testid="goal-title">{goal.title}</h3>
      <p data-testid="goal-desc">{goal.description}</p>
      <p data-testid="goal-target"><strong>Target:</strong> {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : '—'}</p>
      <p data-testid="goal-status"><strong>Status:</strong> {goal.completed ? 'Complete' : 'Open'}</p>
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <button data-testid="btn-toggle" onClick={() => onToggleComplete(goal)}>{goal.completed ? 'Mark Open' : 'Mark Complete'}</button>
        <button data-testid="btn-delete" onClick={() => onDelete(goal)} style={{background:'#d9534f'}}>Delete</button>
      </div>
    </div>
  )
}
