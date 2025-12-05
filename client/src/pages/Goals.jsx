import React, { useState } from 'react'
import { useAppData } from '../context/AppDataContext'

export default function Goals(){
  const { goals, createGoal, deleteGoal } = useAppData()
  const [title, setTitle] = useState('')

  const create = async (e)=>{
    e.preventDefault()
    await createGoal(title)
    setTitle('')
  }

  const remove = async (id)=>{
    await deleteGoal(id)
  }

  return (
    <div className="goals">
      <h1>Goals</h1>
      <form onSubmit={create} className="inline">
        <input data-cy="goal-title-input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="New goal title" required />
        <button data-cy="goal-create-btn">Create</button>
      </form>

      <ul className="list">
        {goals.map(g => (
          <li data-cy="goal-card" key={g._id} className="card">
            <div>
              <strong>{g.title}</strong>
            </div>
            <div>
              <button data-cy="goal-delete-btn" data-id={g._id} onClick={()=>remove(g._id)} className="danger">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
