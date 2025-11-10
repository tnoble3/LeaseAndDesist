import React, { useEffect, useState } from 'react';
import { fetchGoals, createChallenge, fetchChallengesForGoal } from '../api/goalsApi';
import GoalForm from '../components/GoalForm';
import ChallengeCard from '../components/ChallengeCard';
import ProgressBar from '../components/ProgressBar';

export default function Dashboard(){
  const [goals, setGoals] = useState([]);

  const loadGoals = async () => {
    try {
      const res = await fetchGoals();
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(()=>{ loadGoals(); }, []);

  const onGoalCreated = (newGoal) => setGoals(prev => [newGoal, ...prev]);

  return (
    <div>
      <h2>Dashboard</h2>
      <GoalForm onCreated={onGoalCreated} />
      {goals.map(g => (
        <GoalCard key={g.id} goal={g} reload={loadGoals} />
      ))}
    </div>
  );
}

function GoalCard({ goal, reload }) {
  const [challenges, setChallenges] = useState([]);
  useEffect(()=>{ 
    (async () => {
      const res = await fetchChallengesForGoal(goal.id);
      setChallenges(res.data);
    })();
  }, [goal.id]);

  const completed = challenges.filter(c => c.isComplete).length;
  const total = challenges.length;

  const onToggle = (updated) => {
    // refresh list
    setChallenges(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  return (
    <div style={{ margin: 12, padding: 12, border: '1px solid #aaa' }}>
      <h3>{goal.title}</h3>
      <p>{goal.description}</p>
      <ProgressBar completed={completed} total={total} />
      <div>
        {challenges.map(ch => <ChallengeCard key={ch.id} challenge={ch} onToggle={onToggle} />)}
      </div>
      <AddChallengeForm goalId={goal.id} onAdded={() => { /* refresh */ reload(); }} />
    </div>
  );
}

function AddChallengeForm({ goalId, onAdded }) {
  const [title, setTitle] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try {
      await createChallenge({ title, goalId });
      setTitle('');
      if (onAdded) onAdded();
    } catch (err) { console.error(err); }
  };
  return (
    <form onSubmit={submit}>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="New challenge" required />
      <button type="submit">Add</button>
    </form>
  );
}
