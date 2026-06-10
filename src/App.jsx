import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import Dashboard from './components/Dashboard';
import EcoTracker from './components/EcoTracker';
import Community from './components/Community';
import LocalHub from './components/LocalHub';
import ImpactCalculator from './components/ImpactCalculator';
import Sage from './components/Sage';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

function AppContent() {
  const { state } = useApp();

  const renderTab = () => {
    switch (state.activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'tracker': return <EcoTracker />;
      case 'community': return <Community />;
      case 'localhub': return <LocalHub />;
      case 'calculator': return <ImpactCalculator />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
      <Header />
      <main className="main-content">
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <TabNavigation />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={state.activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Sage />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
