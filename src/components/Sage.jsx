import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Volume2, VolumeX, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUSTAINABILITY_TIPS, CATEGORY_META } from '../context/dataHelpers';

export default function Sage() {
  const { state } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'sage',
      text: `Hi! I'm Sage, your eco-assistant 🌿 You've logged ${state.activities.length} activities and earned ${state.points} points. Here are some personalised tips to boost your impact!`,
    },
  ]);
  const [input, setInput] = useState('');
  const carouselRef = useRef(null);
  const bodyRef = useRef(null);

  // Personalise tips based on user activity categories
  const activityCategories = {};
  state.activities.forEach(a => {
    activityCategories[a.category] = (activityCategories[a.category] || 0) + 1;
  });
  const topCategories = Object.entries(activityCategories)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);

  const personalizedTips = [
    ...SUSTAINABILITY_TIPS.filter(t => topCategories.includes(t.category)),
    ...SUSTAINABILITY_TIPS.filter(t => !topCategories.includes(t.category)),
  ].slice(0, 8);

  // Text-to-speech
  const speak = (text) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.volume = 0.8;
    window.speechSynthesis.speak(utter);
  };

  const toggleTTS = () => {
    if (ttsEnabled) {
      window.speechSynthesis?.cancel();
    }
    setTtsEnabled(!ttsEnabled);
  };

  // Speak latest sage message on mount
  useEffect(() => {
    if (isOpen && ttsEnabled && messages.length > 0) {
      const lastSageMsg = [...messages].reverse().find(m => m.from === 'sage');
      if (lastSageMsg) speak(lastSageMsg.text);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);

    // Simple response logic
    const lower = input.toLowerCase();
    let response = '';
    if (lower.includes('tip') || lower.includes('suggestion') || lower.includes('help')) {
      const tip = personalizedTips[Math.floor(Math.random() * personalizedTips.length)];
      response = `${tip.icon} ${tip.title}: ${tip.desc}`;
    } else if (lower.includes('points') || lower.includes('score')) {
      response = `You currently have ${state.points} eco-points! Keep logging activities to earn more. 🎯`;
    } else if (lower.includes('streak')) {
      response = `Your current streak is ${state.streak} days! ${state.streak >= 7 ? 'Amazing consistency! 🔥' : 'Keep going to build momentum! 💪'}`;
    } else if (lower.includes('badge')) {
      const unlocked = state.badges.filter(b => b.unlocked).length;
      response = `You've unlocked ${unlocked} out of ${state.badges.length} badges. ${unlocked < state.badges.length ? `Try to unlock "${state.badges.find(b => !b.unlocked)?.name}" next!` : 'You\'ve unlocked them all! 🏆'}`;
    } else if (lower.includes('carbon') || lower.includes('co2')) {
      const totalSaved = state.activities.filter(a => a.co2 <= 0 || a.positive).reduce((s, a) => s + Math.abs(a.co2), 0).toFixed(1);
      response = `You've saved approximately ${totalSaved} kg of CO₂ through your eco-friendly actions. That's like planting ${(parseFloat(totalSaved) / 21).toFixed(1)} trees! 🌳`;
    } else {
      response = `That's interesting! Here's a quick tip: ${personalizedTips[0].icon} ${personalizedTips[0].desc}. Ask me about your points, streak, badges, or say "tip" for more suggestions! 🌿`;
    }

    setTimeout(() => {
      const sageMsg = { id: Date.now() + 1, from: 'sage', text: response };
      setMessages(prev => [...prev, sageMsg]);
      speak(response);
    }, 600);

    setInput('');
  };

  const scrollCarousel = (dir) => {
    const newIndex = currentTipIndex + dir;
    if (newIndex >= 0 && newIndex < personalizedTips.length) {
      setCurrentTipIndex(newIndex);
    }
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        className="sage-fab"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        id="sage-fab"
        aria-label="Open Sage assistant"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sage-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="sage-header">
              <div className="flex items-center gap-sm">
                <Sparkles size={18} />
                <span className="text-semibold">Sage — Eco Assistant</span>
              </div>
              <motion.button
                onClick={toggleTTS}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={ttsEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
                aria-label={ttsEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
                aria-pressed={ttsEnabled}
                id="sage-tts-toggle"
                style={{ color: '#fff' }}
              >
                {ttsEnabled ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
              </motion.button>
            </div>

            {/* Body */}
            <div className="sage-body" ref={bodyRef}>
              {/* Messages */}
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: 'var(--space-sm) var(--space-md)',
                    borderRadius: 'var(--border-radius-md)',
                    background: msg.from === 'user' ? 'var(--gradient-green)' : 'var(--bg-secondary)',
                    color: msg.from === 'user' ? '#fff' : 'var(--text-primary)',
                    fontSize: 'var(--font-size-sm)',
                    lineHeight: 'var(--line-height-relaxed)',
                  }}
                >
                  {msg.from === 'sage' && (
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>🌿 Sage</div>
                  )}
                  {msg.text}
                  {msg.from === 'sage' && ttsEnabled && (
                    <button
                      onClick={() => speak(msg.text)}
                      style={{ marginLeft: 8, opacity: 0.6, fontSize: 12 }}
                      title="Read aloud"
                      aria-label="Read message aloud"
                    >
                      🔊
                    </button>
                  )}
                </motion.div>
              ))}

              {/* Tips Carousel */}
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-sm)' }}>
                  <span className="text-xs text-semibold text-secondary">💡 Actionable Tips</span>
                  <div className="flex gap-xs">
                    <button className="btn-icon btn-ghost" onClick={() => scrollCarousel(-1)} disabled={currentTipIndex === 0} aria-label="Previous tip">
                      <ChevronLeft size={14} aria-hidden="true" />
                    </button>
                    <button className="btn-icon btn-ghost" onClick={() => scrollCarousel(1)} disabled={currentTipIndex >= personalizedTips.length - 1} aria-label="Next tip">
                      <ChevronRight size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="sage-tips-carousel" ref={carouselRef}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentTipIndex}
                      className="sage-tip-card"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{personalizedTips[currentTipIndex]?.icon}</div>
                      <div className="text-sm text-semibold" style={{ marginBottom: 4 }}>
                        {personalizedTips[currentTipIndex]?.title}
                      </div>
                      <div className="text-xs text-secondary" style={{ lineHeight: 'var(--line-height-relaxed)' }}>
                        {personalizedTips[currentTipIndex]?.desc}
                      </div>
                      <div
                        className="badge"
                        style={{
                          marginTop: 8,
                          background: `${CATEGORY_META[personalizedTips[currentTipIndex]?.category]?.color}18`,
                          color: CATEGORY_META[personalizedTips[currentTipIndex]?.category]?.color,
                        }}
                      >
                        {CATEGORY_META[personalizedTips[currentTipIndex]?.category]?.label}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="flex justify-center gap-xs" style={{ marginTop: 'var(--space-sm)' }}>
                  {personalizedTips.slice(0, 8).map((_, i) => (
                    <button
                      key={i}
                      style={{
                        width: 6, height: 6, borderRadius: '50%',
                        border: 'none', padding: 0,
                        background: i === currentTipIndex ? 'var(--accent-green)' : 'var(--border-color)',
                        transition: 'background 0.3s',
                        cursor: 'pointer',
                      }}
                      onClick={() => setCurrentTipIndex(i)}
                      aria-label={`Go to tip ${i + 1}`}
                      aria-pressed={i === currentTipIndex}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              style={{
                padding: 'var(--space-sm) var(--space-md)',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                gap: 'var(--space-sm)',
              }}
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Sage anything…"
                style={{ flex: 1, fontSize: 'var(--font-size-sm)', padding: '8px 12px' }}
                id="sage-input"
              />
              <motion.button
                type="submit"
                className="btn btn-primary btn-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Send
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
