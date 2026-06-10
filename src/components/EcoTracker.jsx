import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, TrendingUp, PieChart } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';
import { CATEGORY_META, exportToCSV, formatDate } from '../context/dataHelpers';
import EcoChart from './EcoChart';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function EcoTracker() {
  const { state } = useApp();
  const isDark = state.theme === 'dark';

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown = {};
    state.activities.forEach(a => {
      if (!breakdown[a.category]) breakdown[a.category] = 0;
      breakdown[a.category] += Math.abs(a.co2);
    });
    return breakdown;
  }, [state.activities]);

  const doughnutData = {
    labels: Object.keys(categoryBreakdown).map(k => CATEGORY_META[k]?.label || k),
    datasets: [{
      data: Object.values(categoryBreakdown).map(v => parseFloat(v.toFixed(1))),
      backgroundColor: Object.keys(categoryBreakdown).map(k => CATEGORY_META[k]?.color || '#999'),
      borderColor: isDark ? '#1C2B3A' : '#fff',
      borderWidth: 3,
      hoverOffset: 8,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDark ? '#B0BEC5' : '#636E72',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: { family: 'Inter', size: 12 },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1C2B3A' : '#fff',
        titleColor: isDark ? '#E8E8E8' : '#2D3436',
        bodyColor: isDark ? '#B0BEC5' : '#636E72',
        borderColor: isDark ? '#2A3A4A' : '#E0D8CC',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="text-3xl text-bold" style={{ marginBottom: 4 }}>
            <span className="flex items-center gap-sm">
              <TrendingUp size={28} style={{ color: 'var(--accent-green)' }} />
              My Eco Tracker
            </span>
          </h1>
          <p className="text-secondary">Visualise your carbon footprint trends and breakdown</p>
        </div>
        <motion.button
          className="btn btn-secondary"
          onClick={() => exportToCSV(state.activities)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          id="tracker-export-btn"
        >
          <Download size={16} /> Export All Data
        </motion.button>
      </div>

      {/* Full Chart */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <EcoChart />
      </div>

      <div className="dashboard-grid">
        {/* Category Breakdown */}
        <div className="card">
          <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-lg)' }}>
            <PieChart size={18} style={{ color: 'var(--accent-teal)' }} />
            <h3 className="text-md text-semibold">Category Breakdown</h3>
          </div>
          <div style={{ height: 280 }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Activity History */}
        <div className="card">
          <h3 className="text-md text-semibold" style={{ marginBottom: 'var(--space-md)' }}>
            Activity History
          </h3>
          <div className="activity-list" style={{ maxHeight: 400 }}>
            {state.activities.slice(0, 20).map((act, i) => (
              <motion.div
                key={act.id}
                className="activity-item"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ x: 4, backgroundColor: 'var(--bg-card-hover)' }}
              >
                <div className="flex items-center gap-md">
                  <div
                    className="activity-category-icon"
                    style={{
                      background: `${CATEGORY_META[act.category]?.color}18`,
                      color: CATEGORY_META[act.category]?.color,
                    }}
                  >
                    {act.icon}
                  </div>
                  <div>
                    <div className="text-sm text-semibold">{act.label}</div>
                    <div className="text-xs text-tertiary">
                      {act.quantity} {act.unit} • {formatDate(new Date(act.timestamp))}
                    </div>
                  </div>
                </div>
                <div className={`badge ${act.co2 <= 0 || act.positive ? '' : 'badge-red'}`}>
                  {act.co2 <= 0 || act.positive ? '−' : '+'}{Math.abs(act.co2).toFixed(1)} kg
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
