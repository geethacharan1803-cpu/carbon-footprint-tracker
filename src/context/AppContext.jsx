import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  generateSeedData, calculateStreak, calculatePoints,
  getUnlockedBadges, SAMPLE_CHALLENGES, SAMPLE_LEADERBOARD, SAMPLE_PLEDGES,
} from './dataHelpers';

const AppContext = createContext(null);

const STORAGE_KEY = 'carbon-insight-state';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

function getInitialState() {
  const saved = loadState();
  if (saved) return saved;

  const seedActivities = generateSeedData();
  const streak = calculateStreak(seedActivities);
  const points = calculatePoints(seedActivities);
  const badges = getUnlockedBadges(seedActivities, streak);

  return {
    theme: 'light',
    activeTab: 'dashboard',
    activities: seedActivities,
    streak,
    points,
    badges,
    challenges: SAMPLE_CHALLENGES,
    leaderboard: SAMPLE_LEADERBOARD.map(u =>
      u.isCurrentUser ? { ...u, points, co2Saved: parseFloat((points * 0.03).toFixed(1)) } : u
    ).sort((a, b) => b.points - a.points).map((u, i) => ({ ...u, rank: i + 1 })),
    pledges: SAMPLE_PLEDGES,
    notifications: [],
    showEquivalentImpact: false,
    notificationsEnabled: false,
    lastNotificationCheck: null,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };

    case 'SET_TAB':
      return { ...state, activeTab: action.payload };

    case 'ADD_ACTIVITY': {
      const activities = [action.payload, ...state.activities];
      const streak = calculateStreak(activities);
      const points = calculatePoints(activities);
      const badges = getUnlockedBadges(activities, streak);
      const leaderboard = state.leaderboard.map(u =>
        u.isCurrentUser ? { ...u, points, co2Saved: parseFloat((points * 0.03).toFixed(1)) } : u
      ).sort((a, b) => b.points - a.points).map((u, i) => ({ ...u, rank: i + 1 }));
      return { ...state, activities, streak, points, badges, leaderboard };
    }

    case 'TOGGLE_EQUIVALENT_IMPACT':
      return { ...state, showEquivalentImpact: !state.showEquivalentImpact };

    case 'JOIN_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.map(c =>
          c.id === action.payload ? { ...c, joined: true, participants: c.participants + 1 } : c
        ),
      };

    case 'LEAVE_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.map(c =>
          c.id === action.payload ? { ...c, joined: false, participants: c.participants - 1 } : c
        ),
      };

    case 'UPDATE_PLEDGE':
      return {
        ...state,
        pledges: state.pledges.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
      };

    case 'ADD_PLEDGE':
      return { ...state, pledges: [...state.pledges, action.payload] };

    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications].slice(0, 20) };

    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    case 'ENABLE_NOTIFICATIONS':
      return { ...state, notificationsEnabled: true };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, getInitialState);

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  // Notification scheduler (Instruction 9)
  useEffect(() => {
    if (!state.notificationsEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      // Prompt at 9 AM and 7 PM
      if (hour === 9 || hour === 19) {
        if (Notification.permission === 'granted') {
          new Notification('🌿 Carbon Insight', {
            body: "Don't forget to log your activities today! Every action counts.",
            icon: '🌿',
          });
        }
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: `notif-${Date.now()}`,
            message: "Time to log your eco-activities!",
            timestamp: now.toISOString(),
            read: false,
          },
        });
      }
    }, 60 * 60 * 1000); // check every hour

    return () => clearInterval(interval);
  }, [state.notificationsEnabled]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
