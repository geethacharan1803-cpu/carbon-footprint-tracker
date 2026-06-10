import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Trophy, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function GamificationDisplay() {
  const { state } = useApp();
  const { points, streak, badges } = state;
  const [showShareMenu, setShowShareMenu] = useState(false);

  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  const handleShare = async (platform) => {
    const text = `🌿 I've earned ${points} eco-points and ${unlockedBadges.length} badges on Carbon Insight! My ${streak}-day streak is going strong. Join me in reducing carbon footprints! #CarbonInsight #Sustainability`;
    const url = window.location.href;

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({ title: 'Carbon Insight — My Progress', text, url });
      } catch { /* cancelled */ }
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(`${text}\n${url}`);
    }
    setShowShareMenu(false);
  };

  return (
    <div className="card">
      <div className="section-header">
        <div className="flex items-center gap-sm">
          <Trophy size={20} style={{ color: 'var(--accent-amber)' }} />
          <h3 className="text-lg text-bold">Gamification</h3>
        </div>
        <div style={{ position: 'relative' }}>
          <motion.button
            className="btn btn-primary btn-sm"
            onClick={() => setShowShareMenu(!showShareMenu)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            id="share-progress-btn"
          >
            <Share2 size={14} /> Share Progress
          </motion.button>
          <AnimatePresence>
            {showShareMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 8,
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-md)', boxShadow: 'var(--shadow-lg)',
                  padding: 'var(--space-sm)', zIndex: 10, minWidth: 160,
                }}
              >
                {navigator.share && (
                  <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => handleShare('native')}>📤 Share…</button>
                )}
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => handleShare('twitter')}>🐦 Twitter / X</button>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => handleShare('linkedin')}>💼 LinkedIn</button>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => handleShare('facebook')}>📘 Facebook</button>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => handleShare('copy')}>📋 Copy Link</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="gamification-section">
        {/* Points & Streak */}
        <div className="points-display">
          <div className="text-sm text-secondary" style={{ marginBottom: 4 }}>Total Points</div>
          <motion.div
            className="points-value"
            key={points}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {points.toLocaleString()}
          </motion.div>

          {/* Daily Streak */}
          <motion.div
            className="streak-container"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <span className="streak-flame">🔥</span>
            <span className="streak-count">{streak}</span>
            <span className="text-sm text-secondary">day streak</span>
          </motion.div>
        </div>

        {/* Badges */}
        <div>
          <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-md)' }}>
            <Award size={16} style={{ color: 'var(--accent-teal)' }} />
            <span className="text-sm text-semibold">Badges ({unlockedBadges.length}/{badges.length})</span>
          </div>
          <div className="badges-grid">
            {unlockedBadges.map(badge => (
              <motion.div
                key={badge.id}
                className="badge-item"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1, y: -4 }}
                title={badge.desc}
              >
                <span className="badge-icon">{badge.icon}</span>
                <span className="badge-name">{badge.name}</span>
              </motion.div>
            ))}
            {lockedBadges.map(badge => (
              <motion.div
                key={badge.id}
                className="badge-item locked"
                whileHover={{ scale: 1.05 }}
                title={`Locked: ${badge.desc}`}
              >
                <span className="badge-icon">🔒</span>
                <span className="badge-name">{badge.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
