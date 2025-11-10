import React from 'react';
import { updateChallenge } from '../api/goalsApi';

export default function ChallengeCard({ challenge, onToggle }) {
  const toggle = async () => {
    try {
      const res = await updateChallenge(challenge.id, { isComplete: !challenge.isComplete });
      if (onToggle) onToggle(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to update challenge');
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: 8, margin: 8 }}>
      <h4>{challenge.title}</h4>
      <p>{challenge.description}</p>
      <p>Status: {challenge.isComplete ? 'Complete' : 'Incomplete'}</p>
      <button onClick={toggle}>{challenge.isComplete ? 'Mark Incomplete' : 'Mark Complete'}</button>
    </div>
  );
}
