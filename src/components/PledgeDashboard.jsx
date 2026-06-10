import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, PartyPopper } from 'lucide-react';
import { useApp } from '../context/AppContext';

function ConfettiEffect() {
  const colors = ['#4CAF50', '#FF8F00', '#42A5F5', '#AB47BC', '#26A69A', '#FFD700'];
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 1.5,
    size: Math.random() * 8 + 6,
    shape: Math.random() > 0.5 ? 'circle' : 'rect',
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100 }}>
      {pieces.map(p => (
        <motion.div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            width: p.size,
            height: p.shape === 'rect' ? p.size * 0.6 : p.size,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            background: p.color,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: '100vh', rotate: 720, opacity: 0 }}
          transition={{ duration: 2.5 + Math.random(), delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}

export default function PledgeDashboard() {
  const { state, dispatch } = useApp();
  const { pledges } = state;
  const [showConfetti, setShowConfetti] = useState(false);
  const [newPledge, setNewPledge] = useState({ title: '', target: '', unit: 'days' });
  const [showForm, setShowForm] = useState(false);

  const completedCount = pledges.filter(p => p.completed || p.current >= p.target).length;
  const communityPct = Math.round((completedCount / Math.max(pledges.length, 1)) * 100);

  const handleIncrementPledge = (pledge) => {
    if (pledge.current >= pledge.target) return;
    const newCurrent = pledge.current + 1;
    const completed = newCurrent >= pledge.target;
    dispatch({
      type: 'UPDATE_PLEDGE',
      payload: { id: pledge.id, current: newCurrent, completed },
    });
    if (completed) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleAddPledge = (e) => {
    e.preventDefault();
    if (!newPledge.title || !newPledge.target) return;
    dispatch({
      type: 'ADD_PLEDGE',
      payload: {
        id: `p-${Date.now()}`,
        title: newPledge.title,
        target: parseInt(newPledge.target),
        current: 0,
        unit: newPledge.unit,
        category: 'general',
      },
    });
    setNewPledge({ title: '', target: '', unit: 'days' });
    setShowForm(false);
  };

  return (
    <div className="card">
      <AnimatePresence>
        {showConfetti && <ConfettiEffect />}
      </AnimatePresence>

      <div className="section-header">
        <div className="flex items-center gap-sm">
          <Target size={20} style={{ color: 'var(--accent-teal)' }} />
          <h3 className="text-lg text-bold">My Pledges</h3>
        </div>
        <motion.button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowForm(!showForm)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          id="add-pledge-btn"
        >
          <Plus size={14} /> Add Pledge
        </motion.button>
      </div>

      {/* Community Participation */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-xs)' }}>
          <span className="text-sm text-secondary">Community participation</span>
          <span className="text-sm text-semibold">{communityPct}%</span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${communityPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* New Pledge Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAddPledge}
            style={{ overflow: 'hidden', marginBottom: 'var(--space-md)' }}
          >
            <div className="flex gap-sm" style={{ marginBottom: 'var(--space-sm)' }}>
              <input
                placeholder="Pledge title…"
                value={newPledge.title}
                onChange={e => setNewPledge({ ...newPledge, title: e.target.value })}
                style={{ flex: 2 }}
              />
              <input
                type="number"
                placeholder="Target"
                min="1"
                value={newPledge.target}
                onChange={e => setNewPledge({ ...newPledge, target: e.target.value })}
                style={{ flex: 1 }}
              />
              <select
                value={newPledge.unit}
                onChange={e => setNewPledge({ ...newPledge, unit: e.target.value })}
                style={{ flex: 1 }}
              >
                <option value="days">days</option>
                <option value="times">times</option>
                <option value="meals">meals</option>
                <option value="rides">rides</option>
              </select>
              <button type="submit" className="btn btn-primary">Add</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Pledge List */}
      <div className="pledge-list">
        {pledges.map((pledge, i) => {
          const pct = Math.round((pledge.current / pledge.target) * 100);
          const isComplete = pledge.completed || pledge.current >= pledge.target;
          return (
            <motion.div
              key={pledge.id}
              className="pledge-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="pledge-header">
                <div className="flex items-center gap-sm">
                  {isComplete && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <PartyPopper size={16} style={{ color: 'var(--accent-amber)' }} />
                    </motion.span>
                  )}
                  <span className="pledge-title">{pledge.title}</span>
                </div>
                <div className="flex items-center gap-sm">
                  <span className="pledge-progress-text">
                    {pledge.current}/{pledge.target} {pledge.unit}
                  </span>
                  {!isComplete && (
                    <motion.button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleIncrementPledge(pledge)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      +1
                    </motion.button>
                  )}
                </div>
              </div>
              <div className={`progress-bar ${isComplete ? '' : 'progress-bar-amber'}`}>
                <motion.div
                  className="progress-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(pct, 100)}%` }}
                  transition={{ duration: 0.8, delay: i * 0.15 }}
                />
              </div>
              {isComplete && (
                <motion.div
                  className="badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ marginTop: 8 }}
                >
                  ✅ Completed!
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
