import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, ExternalLink, Copy, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SocialShare({ compact = false }) {
  const { state } = useApp();
  const [copied, setCopied] = useState(false);

  const shareText = `🌿 I've earned ${state.points} eco-points and maintained a ${state.streak}-day streak on Carbon Insight! Join me in making a difference. #CarbonInsight #Sustainability #EcoLiving`;
  const shareUrl = window.location.href;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Carbon Insight Progress', text: shareText, url: shareUrl });
      } catch { /* cancelled */ }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    {
      name: 'Twitter / X',
      icon: <span style={{ fontSize: 14 }}>𝕏</span>,
      color: '#1DA1F2',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: <span style={{ fontSize: 14 }}>in</span>,
      color: '#0A66C2',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Facebook',
      icon: <span style={{ fontSize: 14 }}>f</span>,
      color: '#1877F2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    },
  ];

  if (compact) {
    return (
      <div className="flex gap-sm">
        {platforms.map(p => (
          <motion.a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-icon btn-secondary"
            whileHover={{ scale: 1.1, color: p.color }}
            whileTap={{ scale: 0.9 }}
            title={`Share on ${p.name}`}
          >
            {p.icon}
          </motion.a>
        ))}
        <motion.button
          className="btn-icon btn-secondary"
          onClick={handleCopy}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Copy to clipboard"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </motion.button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="section-header">
        <div className="flex items-center gap-sm">
          <Share2 size={20} style={{ color: 'var(--accent-teal)' }} />
          <h3 className="text-lg text-bold">Share Your Impact</h3>
        </div>
      </div>

      {/* Share preview card */}
      <div
        style={{
          background: 'var(--gradient-green)',
          borderRadius: 'var(--border-radius-lg)',
          padding: 'var(--space-xl)',
          color: '#fff',
          marginBottom: 'var(--space-lg)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 8 }}>🌍</div>
        <h4 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 8 }}>My Carbon Insight Journey</h4>
        <div className="flex justify-center gap-xl" style={{ marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900 }}>{state.points}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>Eco Points</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900 }}>{state.streak}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>Day Streak</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900 }}>{state.badges.filter(b => b.unlocked).length}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>Badges</div>
          </div>
        </div>
      </div>

      <div className="flex gap-sm flex-wrap">
        {navigator.share && (
          <motion.button
            className="btn btn-primary"
            onClick={handleNativeShare}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 size={16} /> Share…
          </motion.button>
        )}
        {platforms.map(p => (
          <motion.a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            whileHover={{ scale: 1.05, borderColor: p.color, color: p.color }}
            whileTap={{ scale: 0.95 }}
          >
            {p.icon} {p.name}
          </motion.a>
        ))}
        <motion.button
          className="btn btn-secondary"
          onClick={handleCopy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Link</>}
        </motion.button>
      </div>
    </div>
  );
}
