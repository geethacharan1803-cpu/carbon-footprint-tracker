import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Download, Plus, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  ACTIVITY_OPTIONS, CATEGORY_META, calculateCO2, getDailyCO2,
  DAILY_CO2_BUDGET, exportToCSV, formatTime,
} from '../context/dataHelpers';

// Circular progress ring component
function CircularProgress({ value, max, size = 120, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);
  const color = pct > 0.9 ? 'var(--accent-red)' : pct > 0.7 ? 'var(--accent-amber)' : 'var(--accent-green)';

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--bg-secondary)" strokeWidth={strokeWidth} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="circular-progress-text">
        <div>{value.toFixed(1)}</div>
        <div className="circular-progress-label">/ {max} kg</div>
      </div>
    </div>
  );
}

export default function ActivityLogger() {
  const { state, dispatch } = useApp();
  const [category, setCategory] = useState('transport');
  const [activityId, setActivityId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  const dailyCO2 = getDailyCO2(state.activities);
  const todayActivities = state.activities.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    return new Date(a.timestamp).toISOString().split('T')[0] === today;
  });

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    if (!activityId || !quantity || parseFloat(quantity) <= 0) return;

    const opt = ACTIVITY_OPTIONS[category].find(o => o.id === activityId);
    if (!opt) return;

    const co2 = calculateCO2(category, activityId, parseFloat(quantity));
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: `act-${Date.now()}`,
        category,
        activityId,
        label: opt.label,
        icon: opt.icon,
        unit: opt.unit,
        quantity: parseFloat(quantity),
        co2,
        positive: opt.positive || false,
        timestamp: new Date().toISOString(),
      },
    });
    setActivityId('');
    setQuantity('');
  }, [activityId, quantity, category, dispatch]);

  // Voice input (Instruction 17)
  const toggleVoice = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      // Parse voice: "biked 5 kilometers" → category: transport, activity: bike_km, qty: 5
      const numMatch = transcript.match(/(\d+(?:\.\d+)?)/);
      if (numMatch) setQuantity(numMatch[1]);

      // Try to match activity keywords
      for (const [cat, opts] of Object.entries(ACTIVITY_OPTIONS)) {
        for (const opt of opts) {
          const keywords = opt.label.toLowerCase().split(' ');
          if (keywords.some(k => transcript.includes(k))) {
            setCategory(cat);
            setActivityId(opt.id);
            break;
          }
        }
      }
      setIsRecording(false);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    setIsRecording(true);
  }, [isRecording]);

  return (
    <div className="card">
      <div className="section-header">
        <div className="flex items-center gap-sm">
          <Activity size={20} style={{ color: 'var(--accent-green)' }} />
          <h3 className="text-lg text-bold">Log Activity</h3>
        </div>
        <div className="flex items-center gap-sm">
          <motion.button
            className="btn btn-secondary btn-sm"
            onClick={() => exportToCSV(state.activities)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            id="export-csv-btn"
          >
            <Download size={14} /> Export CSV
          </motion.button>
        </div>
      </div>

      {/* Daily CO₂ Budget Circular Progress */}
      <div className="flex items-center gap-xl" style={{ marginBottom: 'var(--space-lg)' }}>
        <CircularProgress value={dailyCO2} max={DAILY_CO2_BUDGET} />
        <div>
          <h4 className="text-md text-semibold">Daily CO₂ Budget</h4>
          <p className="text-sm text-secondary" style={{ marginTop: 4 }}>
            {dailyCO2 < DAILY_CO2_BUDGET
              ? `${(DAILY_CO2_BUDGET - dailyCO2).toFixed(1)} kg remaining today`
              : 'Daily budget exceeded — try offsetting!'}
          </p>
          <p className="text-xs text-tertiary" style={{ marginTop: 4 }}>
            {todayActivities.length} activities logged today
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-pills" style={{ marginBottom: 'var(--space-md)' }}>
        {Object.entries(CATEGORY_META).map(([key, meta]) => (
          <button
            key={key}
            className={`category-pill ${category === key ? 'active' : ''}`}
            onClick={() => { setCategory(key); setActivityId(''); }}
          >
            <span>{meta.icon}</span> {meta.label}
          </button>
        ))}
      </div>

      {/* Activity Form */}
      <form className="activity-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="activity-select">Activity</label>
          <select
            id="activity-select"
            value={activityId}
            onChange={e => setActivityId(e.target.value)}
          >
            <option value="">Select activity…</option>
            {ACTIVITY_OPTIONS[category].map(opt => (
              <option key={opt.id} value={opt.id}>
                {opt.icon} {opt.label} ({opt.unit})
              </option>
            ))}
          </select>
        </div>
        <div className="input-group">
          <label htmlFor="quantity-input">Quantity</label>
          <div className="flex items-center gap-sm">
            <input
              id="quantity-input"
              type="number"
              min="0.1"
              step="0.1"
              placeholder="e.g. 5"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              style={{ flex: 1 }}
            />
            <motion.button
              type="button"
              className={`mic-btn ${isRecording ? 'recording' : ''}`}
              onClick={toggleVoice}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Voice input"
              id="voice-input-btn"
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </motion.button>
          </div>
        </div>
        <motion.button
          type="submit"
          className="btn btn-primary btn-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ alignSelf: 'end' }}
          id="log-activity-btn"
        >
          <Plus size={18} /> Log
        </motion.button>
      </form>

      {/* Recent Activities */}
      <div style={{ marginTop: 'var(--space-lg)' }}>
        <h4 className="text-sm text-semibold text-secondary" style={{ marginBottom: 'var(--space-sm)' }}>
          Recent Activity ({state.activities.length} total)
        </h4>
        <div className="activity-list">
          <AnimatePresence>
            {state.activities.slice(0, 8).map((act, i) => (
              <motion.div
                key={act.id}
                className="activity-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{
                  x: 8,
                  backgroundColor: 'var(--bg-card-hover)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: { duration: 0.2 },
                }}
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
                      {act.quantity} {act.unit} • {formatTime(new Date(act.timestamp))}
                    </div>
                  </div>
                </div>
                <div className={`badge ${act.co2 <= 0 || act.positive ? '' : 'badge-red'}`}>
                  {act.co2 <= 0 || act.positive ? '−' : '+'}{Math.abs(act.co2).toFixed(1)} kg
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
