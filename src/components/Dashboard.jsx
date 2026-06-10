import React from 'react';
import StatsGrid from './StatsGrid';
import GamificationDisplay from './GamificationDisplay';
import ActivityLogger from './ActivityLogger';
import PledgeDashboard from './PledgeDashboard';
import EcoChart from './EcoChart';

export default function Dashboard() {
  return (
    <div>
      <StatsGrid />
      <div className="dashboard-grid" style={{ marginTop: 'var(--space-lg)' }}>
        <div className="dashboard-full">
          <div className="card">
            <EcoChart compact />
          </div>
        </div>
        <ActivityLogger />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <GamificationDisplay />
          <PledgeDashboard />
        </div>
      </div>
    </div>
  );
}
