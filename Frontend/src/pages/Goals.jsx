import React, { useState } from 'react'
import GoalCard from '../components/GoalCard'
import { useChallenges } from '../context/ChallengesContext'

export default function Goals(){
  const { challenges, create, update, remove } = useChallenges()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    try{
      await create({ title, description, target_date: targetDate })
      setTitle(''); setDescription(''); setTargetDate('')
    }catch(err){
      console.error(err)
      alert('Failed to create')
    }
  }

  const toggleComplete = async (goal) => {
    try{
      await update(goal._id, { completed: !goal.completed })
    }catch(err){
      console.error(err)
    }
  }

  const removeGoal = async (goal) => {
    if(!confirm('Delete this challenge?')) return
    try{
      await remove(goal._id)
    }catch(err){
      console.error(err)
    }
  }

  return (
    <div>
      <h2>Challenges</h2>
      <form onSubmit={handleCreate} className="card" style={{maxWidth:600}} data-testid="create-challenge-form">
        <div className="form-row">
          <label>Title</label>
          <input data-testid="input-title" value={title} onChange={e=>setTitle(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Description</label>
          <textarea data-testid="input-description" value={description} onChange={e=>setDescription(e.target.value)} />
        </div>
        <div className="form-row">
          <label>Target Date</label>
          <input data-testid="input-target" type="date" value={targetDate} onChange={e=>setTargetDate(e.target.value)} />
        </div>
        <button type="submit" data-testid="btn-create-challenge">Create Challenge</button>
      </form>

      <div style={{marginTop:16}} className="grid">
        {challenges.map(g => (
          <GoalCard key={g._id} goal={g} onToggleComplete={toggleComplete} onDelete={removeGoal} />
        ))}
      </div>
    </div>
  )
}
