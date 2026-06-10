import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users as UsersIcon, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORY_META } from '../context/dataHelpers';

export default function Challenges() {
  const { state, dispatch } = useApp();

  return (
    <div>
      <div className="section-header">
        <div>
          <h3 className="text-lg text-bold">Sustainability Challenges</h3>
          <p className="text-sm text-secondary">Join challenges and compete with the community</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
        {state.challenges.map((ch, i) => {
          const meta = CATEGORY_META[ch.category] || {};
          const pct = Math.round((ch.progress / ch.target) * 100);
          return (
            <motion.div
              key={ch.id}
              className="challenge-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}
            >
              <div className="flex justify-between items-start" style={{ marginBottom: 'var(--space-md)' }}>
                <span style={{ fontSize: 32 }}>{ch.icon}</span>
                <span
                  className="challenge-badge"
                  style={{
                    background: `${meta.color || 'var(--accent-green)'}18`,
                    color: meta.color || 'var(--accent-green)',
                  }}
                >
                  {meta.label || ch.category}
                </span>
              </div>
              <h4 className="text-md text-semibold" style={{ marginBottom: 4 }}>{ch.title}</h4>
              <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-md)' }}>
                {ch.description}
              </p>
              <div className="flex items-center gap-md text-xs text-tertiary" style={{ marginBottom: 'var(--space-md)' }}>
                <span className="flex items-center gap-xs">
                  <UsersIcon size={12} /> {ch.participants.toLocaleString()} joined
                </span>
                <span className="flex items-center gap-xs">
                  <Clock size={12} /> {ch.daysLeft} days left
                </span>
              </div>

              {ch.joined && (
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <div className="flex justify-between text-xs text-secondary" style={{ marginBottom: 4 }}>
                    <span>Progress</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              )}

              <motion.button
                className={`btn ${ch.joined ? 'btn-secondary' : 'btn-primary'}`}
                style={{ width: '100%' }}
                onClick={() => dispatch({ type: ch.joined ? 'LEAVE_CHALLENGE' : 'JOIN_CHALLENGE', payload: ch.id })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {ch.joined ? 'Leave Challenge' : (
                  <>Join Challenge <ArrowRight size={14} /></>
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
