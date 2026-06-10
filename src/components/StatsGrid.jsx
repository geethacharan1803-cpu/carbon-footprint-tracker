import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Trees, Flame, TrendingUp, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getEquivalentImpact, getProjectedMonthly } from '../context/dataHelpers';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function StatsGrid() {
  const { state, dispatch } = useApp();
  const { activities, showEquivalentImpact, streak, points } = state;

  const totalCO2 = activities.reduce((sum, a) => sum + Math.abs(a.co2), 0).toFixed(1);
  const totalSaved = activities.filter(a => a.co2 <= 0 || a.positive).reduce((sum, a) => sum + Math.abs(a.co2), 0).toFixed(1);
  const impact = getEquivalentImpact(parseFloat(totalSaved));
  const projectedMonthly = getProjectedMonthly(activities);

  const stats = showEquivalentImpact
    ? [
        { label: 'Trees Equivalent', value: impact.trees, icon: '🌳', colorClass: 'green', trend: '+12%', trendDir: 'positive' },
        { label: 'Car Miles Avoided', value: impact.carMiles, icon: '🚗', colorClass: 'teal', trend: '+8%', trendDir: 'positive' },
        { label: 'Phone Charges Saved', value: impact.phoneCharges, icon: '📱', colorClass: 'amber', trend: '+15%', trendDir: 'positive' },
        { label: 'Light Bulb Hours', value: impact.lightBulbHours, icon: '💡', colorClass: 'blue', trend: '+5%', trendDir: 'positive' },
      ]
    : [
        { label: 'Total CO₂ Tracked', value: `${totalCO2} kg`, icon: '📊', colorClass: 'green', trend: '-5%', trendDir: 'positive' },
        { label: 'CO₂ Saved', value: `${totalSaved} kg`, icon: '🌱', colorClass: 'teal', trend: '+12%', trendDir: 'positive' },
        { label: 'Daily Streak', value: `${streak} days`, icon: '🔥', colorClass: 'amber', trend: streak > 0 ? 'Active' : 'Start today!', trendDir: streak > 0 ? 'positive' : 'negative' },
        { label: 'Projected Monthly', value: `${projectedMonthly} kg`, icon: '📈', colorClass: 'blue', trend: projectedMonthly < 330 ? 'Below avg' : 'Above avg', trendDir: projectedMonthly < 330 ? 'positive' : 'negative' },
      ];

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Overview</h2>
          <p className="section-subtitle">Your sustainability at a glance</p>
        </div>
        <motion.button
          className="btn btn-secondary btn-sm"
          onClick={() => dispatch({ type: 'TOGGLE_EQUIVALENT_IMPACT' })}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          id="toggle-equivalent-impact"
        >
          {showEquivalentImpact ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          {showEquivalentImpact ? 'Show Raw Data' : 'Equivalent Impact'}
        </motion.button>
      </div>

      <motion.div
        className="stats-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={showEquivalentImpact ? 'equiv' : 'raw'}
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className={`stat-card ${stat.colorClass}`}
            variants={cardVariants}
            whileHover={{
              scale: 1.03,
              boxShadow: stat.colorClass === 'green' ? 'var(--shadow-glow-green)'
                : stat.colorClass === 'teal' ? 'var(--shadow-glow-teal)'
                : stat.colorClass === 'amber' ? 'var(--shadow-glow-amber)'
                : 'var(--shadow-lg)',
            }}
          >
            <div className={`stat-icon ${stat.colorClass}`}>
              <span>{stat.icon}</span>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            <div className={`stat-trend ${stat.trendDir}`}>
              {stat.trend}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
