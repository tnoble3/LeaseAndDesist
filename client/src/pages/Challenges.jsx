import React, { useEffect, useState } from 'react'
import { useAppData } from '../context/AppDataContext'

export default function Challenges(){
  const { goals, challenges, createChallenge, toggleChallenge, deleteChallenge } = useAppData()
  const [selectedGoal, setSelectedGoal] = useState('')
  const [title, setTitle] = useState('')
  const [targetDate, setTargetDate] = useState('')

  useEffect(()=>{
    if (goals && goals[0] && !selectedGoal) setSelectedGoal(goals[0]._id)
  }, [goals, selectedGoal])

  const create = async (e)=>{
    e.preventDefault()
    await createChallenge({ title, goalId: selectedGoal, targetDate })
    setTitle('')
    setTargetDate('')
  }

  const toggle = async (id, completed)=>{
    await toggleChallenge(id, completed)
  }

  const remove = async (id)=>{
    await deleteChallenge(id)
  }

  return (
    <div className="challenges">
      <h1>Challenges</h1>
      <div className="controls inline">
        <label>Goal</label>
        <select data-cy="challenge-goal-select" value={selectedGoal} onChange={e=>setSelectedGoal(e.target.value)}>
          {goals.map(g=> <option key={g._id} value={g._id}>{g.title}</option>)}
        </select>
      </div>

      <form onSubmit={create} className="inline">
        <input data-cy="challenge-title-input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="New challenge title" required />
        <input type="date" value={targetDate} onChange={e=>setTargetDate(e.target.value)} placeholder="Target date" />
        <button data-cy="challenge-create-btn">Create</button>
      </form>

      <ul className="list">
        {challenges.filter(c=> c.goal === selectedGoal).map(c=> (
          <li data-cy="challenge-card" key={c._id} className="card">
            <div>
              <strong>{c.title}</strong>
              <div className="muted">{c.description}</div>
              {c.targetDate && <div className="muted">Due: {new Date(c.targetDate).toLocaleDateString()}</div>}
            </div>
            <div className="actions">
              <button data-cy="challenge-complete-btn" data-id={c._id} onClick={()=>toggle(c._id, c.completed)} className={c.completed? 'primary' : ''}>{c.completed? 'Undo' : 'Complete'}</button>
              <button data-cy="challenge-delete-btn" data-id={c._id} onClick={()=>remove(c._id)} className="danger">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
