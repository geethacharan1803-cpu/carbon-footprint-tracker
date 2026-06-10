import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Leaf, Car, Zap, UtensilsCrossed, Droplets } from 'lucide-react';

const SCENARIOS = [
  {
    id: 'bike_commute',
    label: 'Bike instead of driving',
    unit: 'km/week',
    max: 100,
    default: 20,
    factor: 0.21, // kg CO₂ saved per km
    icon: '🚲',
    desc: 'Switch your car commute to cycling',
  },
  {
    id: 'meatless_meals',
    label: 'Replace meat with vegan meals',
    unit: 'meals/week',
    max: 21,
    default: 5,
    factor: 2.4, // kg CO₂ saved per meal
    icon: '🥗',
    desc: 'Choose plant-based meals over meat',
  },
  {
    id: 'reduce_electricity',
    label: 'Reduce electricity usage',
    unit: 'kWh/week',
    max: 100,
    default: 15,
    factor: 0.475, // kg CO₂ per kWh
    icon: '⚡',
    desc: 'Turn off lights, unplug devices',
  },
  {
    id: 'shorter_showers',
    label: 'Shorten showers by 3 min',
    unit: 'showers/week',
    max: 14,
    default: 7,
    factor: 0.3, // kg CO₂ per shortened shower
    icon: '🚿',
    desc: 'Save water and energy heating it',
  },
  {
    id: 'public_transit',
    label: 'Use public transit',
    unit: 'km/week',
    max: 200,
    default: 30,
    factor: 0.121, // difference car vs bus per km
    icon: '🚌',
    desc: 'Take buses or trains instead of driving',
  },
  {
    id: 'recycle',
    label: 'Recycle waste',
    unit: 'kg/week',
    max: 20,
    default: 5,
    factor: 0.5,
    icon: '♻️',
    desc: 'Separate and recycle household waste',
  },
];

export default function ImpactCalculator() {
  const [values, setValues] = useState(
    Object.fromEntries(SCENARIOS.map(s => [s.id, s.default]))
  );

  const results = useMemo(() => {
    let weeklyTotal = 0;
    const breakdown = SCENARIOS.map(s => {
      const weekly = values[s.id] * s.factor;
      weeklyTotal += weekly;
      return { ...s, weekly };
    });
    const monthly = weeklyTotal * 4.33;
    const yearly = weeklyTotal * 52;
    return {
      breakdown,
      weekly: weeklyTotal,
      monthly,
      yearly,
      trees: (yearly / 21).toFixed(1),
      carMiles: (yearly / 0.404).toFixed(0),
      phoneCharges: (yearly / 0.008).toFixed(0),
    };
  }, [values]);

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="text-3xl text-bold" style={{ marginBottom: 4 }}>
            <span className="flex items-center gap-sm">
              <Calculator size={28} style={{ color: 'var(--accent-green)' }} />
              Impact Calculator
            </span>
          </h1>
          <p className="text-secondary">Simulate CO₂ savings from hypothetical lifestyle changes</p>
        </div>
      </div>

      <div className="calculator-grid">
        {/* Sliders */}
        <div className="card">
          <h3 className="text-md text-semibold" style={{ marginBottom: 'var(--space-lg)' }}>
            Adjust Your Actions
          </h3>
          {SCENARIOS.map(s => (
            <div key={s.id} className="slider-group">
              <label>
                <span>{s.icon} {s.label}</span>
                <span className="text-bold">{values[s.id]} {s.unit}</span>
              </label>
              <input
                type="range"
                min="0"
                max={s.max}
                value={values[s.id]}
                onChange={e => setValues({ ...values, [s.id]: parseInt(e.target.value) })}
              />
              <div className="text-xs text-tertiary">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Results */}
        <div>
          <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="impact-result">
              <div className="text-sm text-secondary" style={{ marginBottom: 8 }}>Projected Annual CO₂ Savings</div>
              <motion.div
                className="impact-value"
                key={results.yearly.toFixed(0)}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {results.yearly.toFixed(0)} kg
              </motion.div>
              <div className="text-sm text-tertiary" style={{ marginTop: 4 }}>
                {results.weekly.toFixed(1)} kg/week • {results.monthly.toFixed(0)} kg/month
              </div>
            </div>

            <div className="impact-equivalents">
              <motion.div className="impact-equiv-card" whileHover={{ scale: 1.05, y: -4 }}>
                <div className="impact-equiv-icon">🌳</div>
                <div className="impact-equiv-value">{results.trees}</div>
                <div className="impact-equiv-label">Trees planted equivalent</div>
              </motion.div>
              <motion.div className="impact-equiv-card" whileHover={{ scale: 1.05, y: -4 }}>
                <div className="impact-equiv-icon">🚗</div>
                <div className="impact-equiv-value">{results.carMiles}</div>
                <div className="impact-equiv-label">Car miles avoided</div>
              </motion.div>
              <motion.div className="impact-equiv-card" whileHover={{ scale: 1.05, y: -4 }}>
                <div className="impact-equiv-icon">📱</div>
                <div className="impact-equiv-value">{results.phoneCharges}</div>
                <div className="impact-equiv-label">Phone charges saved</div>
              </motion.div>
            </div>
          </div>

          {/* Per-action breakdown */}
          <div className="card">
            <h3 className="text-md text-semibold" style={{ marginBottom: 'var(--space-md)' }}>
              Savings Breakdown
            </h3>
            {results.breakdown.map((item, i) => {
              const maxWeekly = Math.max(...results.breakdown.map(b => b.weekly));
              const pct = maxWeekly > 0 ? (item.weekly / maxWeekly) * 100 : 0;
              return (
                <motion.div
                  key={item.id}
                  style={{ marginBottom: 'var(--space-md)' }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex justify-between text-sm" style={{ marginBottom: 4 }}>
                    <span>{item.icon} {item.label}</span>
                    <span className="text-semibold text-green">{item.weekly.toFixed(1)} kg/wk</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
