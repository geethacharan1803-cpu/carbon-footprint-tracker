import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Bell, Leaf } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { requestNotificationPermission } from '../utils/notifications';

export default function Header() {
  const { state, dispatch } = useApp();
  const unreadCount = state.notifications.filter(n => !n.read).length;

  const handleNotificationToggle = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      dispatch({ type: 'ENABLE_NOTIFICATIONS' });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `notif-${Date.now()}`,
          message: '🔔 Daily reminders enabled! We\'ll nudge you to log activities.',
          timestamp: new Date().toISOString(),
          read: false,
        },
      });
    }
  };

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="logo">
          <motion.div
            className="logo-icon"
            whileHover={{ rotate: 15, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Leaf size={20} />
          </motion.div>
          <span>Carbon<span style={{ color: 'var(--accent-green)' }}>Insight</span></span>
        </div>

        <div className="flex items-center gap-sm">
          {/* Notification Bell */}
          <motion.button
            className="btn-icon btn-ghost"
            onClick={handleNotificationToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ position: 'relative' }}
            title={state.notificationsEnabled ? 'Notifications enabled' : 'Enable notifications'}
          >
            <Bell size={20} />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  className="notification-dot"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                />
              )}
            </AnimatePresence>
          </motion.button>

          {/* Dark Mode Toggle */}
          <motion.button
            className="btn-icon btn-secondary"
            onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={state.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            aria-label="Toggle dark mode"
            id="theme-toggle"
          >
            <AnimatePresence mode="wait" initial={false}>
              {state.theme === 'light' ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon size={18} />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
