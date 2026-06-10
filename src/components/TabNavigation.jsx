import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, TrendingUp, Users, MapPin, Calculator } from 'lucide-react';
import { useApp } from '../context/AppContext';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tracker', label: 'My Eco Tracker', icon: TrendingUp },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'localhub', label: 'Local Hub', icon: MapPin },
  { id: 'calculator', label: 'Impact Calculator', icon: Calculator },
];

export default function TabNavigation() {
  const { state, dispatch } = useApp();

  return (
    <nav className="tab-nav" id="main-navigation" role="tablist" aria-label="Main navigation">
      {TABS.map(tab => {
        const Icon = tab.icon;
        const isActive = state.activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
            role="tab"
            aria-selected={isActive}
            id={`tab-${tab.id}`}
          >
            {isActive && (
              <motion.div
                className="tab-indicator"
                layoutId="tab-indicator"
                style={{ position: 'absolute', inset: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <Icon size={16} style={{ position: 'relative', zIndex: 1 }} aria-hidden="true" />
            <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
