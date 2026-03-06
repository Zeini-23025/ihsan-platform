import React from 'react';
import type { NeedStatus } from '../types';
import { Circle, CheckCircle, Clock, Wallet } from 'lucide-react';

interface StatusBadgeProps {
  status: NeedStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<NeedStatus, {
  label: string;
  bg: string;
  color: string;
  icon: React.ReactNode;
}> = {
  OPEN:       { label: 'Ouvert',   bg: 'rgba(45,122,79,0.15)',  color: '#6ec995', icon: <Circle size={8} fill="#6ec995" /> },
  FUNDED:     { label: 'Financé',  bg: 'rgba(45,95,138,0.15)',  color: '#6aaee0', icon: <Wallet size={8} /> },
  DELIVERING: { label: 'En cours', bg: 'rgba(168,117,42,0.15)', color: '#E8B660', icon: <Clock size={8} /> },
  CONFIRMED:  { label: 'Confirmé', bg: 'rgba(201,147,58,0.15)', color: '#C9933A', icon: <CheckCircle size={8} /> },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: size === 'sm' ? '0.15rem 0.55rem' : '0.25rem 0.7rem',
      borderRadius: 999,
      background: cfg.bg,
      color: cfg.color,
      fontSize: size === 'sm' ? '0.72rem' : '0.78rem',
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      border: `1px solid ${cfg.color}40`,
    }}>
      <span style={{ display: 'flex', alignItems: 'center' }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
