import React, { useState } from 'react';
import { createGoal } from '../api/goalsApi';

export default function GoalForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await createGoal({ title, description, targetDate });
      setTitle(''); setDescription(''); setTargetDate('');
      if (onCreated) onCreated(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to create goal');
    }
  };

  return (
    <form onSubmit={submit}>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" required />
      <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" />
      <input type="date" value={targetDate} onChange={e=>setTargetDate(e.target.value)} />
      <button type="submit">Create Goal</button>
    </form>
  );
}
