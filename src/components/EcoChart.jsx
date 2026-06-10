import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Filler, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';
import { getChartData, DAILY_CO2_BUDGET } from '../context/dataHelpers';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Filler, Legend
);

export default function EcoChart({ compact = false }) {
  const { state } = useApp();
  const [period, setPeriod] = useState(30);
  const isDark = state.theme === 'dark';

  const chartData = useMemo(() => getChartData(state.activities, period), [state.activities, period]);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Daily CO₂ (kg)',
        data: chartData.data,
        borderColor: isDark ? '#66BB6A' : '#4CAF50',
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
          gradient.addColorStop(0, isDark ? 'rgba(102,187,106,0.35)' : 'rgba(76,175,80,0.3)');
          gradient.addColorStop(1, isDark ? 'rgba(102,187,106,0.02)' : 'rgba(76,175,80,0.02)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: compact ? 0 : 3,
        pointHoverRadius: 6,
        pointBackgroundColor: isDark ? '#66BB6A' : '#4CAF50',
        pointBorderColor: isDark ? '#1C2B3A' : '#fff',
        pointBorderWidth: 2,
        borderWidth: 2.5,
      },
      {
        label: 'Daily Budget',
        data: Array(chartData.labels.length).fill(DAILY_CO2_BUDGET),
        borderColor: isDark ? 'rgba(255,179,0,0.5)' : 'rgba(255,143,0,0.5)',
        borderDash: [8, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: {
        display: !compact,
        position: 'top',
        labels: {
          color: isDark ? '#B0BEC5' : '#636E72',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
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
        displayColors: true,
        titleFont: { family: 'Inter', weight: '600' },
        bodyFont: { family: 'Inter' },
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} kg CO₂`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#78909C' : '#95A5A6',
          font: { family: 'Inter', size: 11 },
          maxRotation: 45,
          maxTicksLimit: compact ? 7 : 15,
        },
        border: { display: false },
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          drawBorder: false,
        },
        ticks: {
          color: isDark ? '#78909C' : '#95A5A6',
          font: { family: 'Inter', size: 11 },
          callback: (v) => `${v} kg`,
        },
        border: { display: false },
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      {!compact && (
        <div className="section-header">
          <div>
            <h3 className="text-lg text-bold">CO₂ Footprint Trend</h3>
            <p className="text-sm text-secondary">Track your daily emissions over time</p>
          </div>
          <div className="chart-period-toggle">
            {[7, 14, 30].map(d => (
              <motion.button
                key={d}
                className={`chart-period-btn ${period === d ? 'active' : ''}`}
                onClick={() => setPeriod(d)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {d}d
              </motion.button>
            ))}
          </div>
        </div>
      )}
      <div className="chart-container" style={{ height: compact ? 200 : 300 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
