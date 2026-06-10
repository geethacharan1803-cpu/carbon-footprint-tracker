import React from 'react';
import { motion } from 'framer-motion';
import { Crown, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Leaderboard() {
  const { state } = useApp();

  const getRankStyle = (rank) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
  };

  return (
    <div>
      <div className="section-header">
        <div className="flex items-center gap-sm">
          <Crown size={20} style={{ color: 'var(--accent-amber)' }} />
          <h3 className="text-lg text-bold">Leaderboard</h3>
        </div>
        <span className="badge badge-amber">This Month</span>
      </div>

      <div className="leaderboard-list">
        {state.leaderboard.map((user, i) => {
          const rankClass = getRankStyle(user.rank);
          return (
            <motion.div
              key={`${user.name}-${user.rank}`}
              className={`leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ x: 4 }}
            >
              <div className={`leaderboard-rank ${rankClass}`}>
                {user.rank <= 3 ? (
                  user.rank === 1 ? '👑' : user.rank === 2 ? '🥈' : '🥉'
                ) : user.rank}
              </div>
              <div className="leaderboard-avatar">{user.avatar}</div>
              <div style={{ flex: 1 }}>
                <div className="text-sm text-semibold">
                  {user.name} {user.isCurrentUser && <span className="badge" style={{ marginLeft: 4 }}>You</span>}
                </div>
                <div className="text-xs text-tertiary">
                  {user.co2Saved} kg CO₂ saved
                </div>
              </div>
              <div className="flex items-center gap-xs">
                <TrendingUp size={14} style={{ color: 'var(--accent-green)' }} />
                <span className="text-sm text-bold text-green">{user.points.toLocaleString()}</span>
                <span className="text-xs text-tertiary">pts</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
