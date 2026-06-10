import React from 'react';
import Challenges from './Challenges';
import Leaderboard from './Leaderboard';
import SocialShare from './SocialShare';

export default function Community() {
  return (
    <div>
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h1 className="text-3xl text-bold" style={{ marginBottom: 4 }}>Community</h1>
        <p className="text-secondary">Join forces with others to make a bigger impact</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-full">
          <Challenges />
        </div>
        <div className="card">
          <Leaderboard />
        </div>
        <SocialShare />
      </div>
    </div>
  );
}
