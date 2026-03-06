import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, Heart, CheckCircle, Loader2, Store } from 'lucide-react';
import type { Need } from '../types';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';

interface NeedCardProps {
  need: Need;
  onFinance?: () => void;
}

const NeedCard: React.FC<NeedCardProps> = ({ need, onFinance }) => {
  const navigate = useNavigate();

  const raised = need.amountRaised ?? 0;
  const total = need.amount ?? 0;

  const handleFinance = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFinance) {
      onFinance();
    } else {
      navigate(`/needs/${need.id}`);
    }
  };

  return (
    <div
      style={styles.card}
      onClick={() => navigate(`/needs/${need.id}`)}
      className="need-card"
    >
      {/* Header */}
      <div style={styles.header}>
        <StatusBadge status={need.status} size="sm" />
        {need.partenaire && (
          <span style={styles.partnerTag}>
            <Store size={11} />
            {need.partenaire.business_name}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 style={styles.title}>{need.title}</h3>

      {/* Description preview */}
      {need.description && (
        <p style={styles.description}>
          {need.description.length > 100
            ? need.description.slice(0, 100) + '…'
            : need.description}
        </p>
      )}

      {/* Location */}
      {need.city && (
        <div style={styles.location}>
          <MapPin size={12} style={{ color: 'var(--gold)', flexShrink: 0 }} />
          <span>{need.city}</span>
        </div>
      )}

      {/* Progress */}
      <div style={{ margin: '1rem 0' }}>
        <ProgressBar raised={raised} total={total} height={6} />
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.validatorInfo}>
          {need.validateur && (
            <span style={styles.validator}>
              <User size={11} />
              {need.validateur.nom} {need.validateur.prenom}
            </span>
          )}
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleFinance}
          disabled={need.status === 'CONFIRMED' || need.status === 'DELIVERING'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          {need.status === 'CONFIRMED' ? (
            <><CheckCircle size={13} /> Confirmé</>
          ) : need.status === 'DELIVERING' ? (
            <><Loader2 size={13} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> En cours</>
          ) : (
            <><Heart size={13} /> Financer</>
          )}
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '1.25rem',
    cursor: 'pointer',
    transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 4px 24px rgba(201,147,58,0.08)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.4rem',
  },
  partnerTag: {
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    fontSize: '0.72rem', color: 'var(--text-secondary)',
    background: 'var(--card-hover)', padding: '0.15rem 0.5rem', borderRadius: 4,
  },
  title: {
    fontSize: '1rem', fontWeight: 700, color: 'var(--text)',
    marginBottom: '0.5rem', lineHeight: 1.3,
  },
  description: {
    fontSize: '0.85rem', color: 'var(--text-secondary)',
    lineHeight: 1.5, marginBottom: '0.5rem',
  },
  location: {
    display: 'flex', alignItems: 'center', gap: '0.3rem',
    fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.25rem',
  },
  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 'auto', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem',
  },
  validatorInfo: { flex: 1 },
  validator: {
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    fontSize: '0.8rem', color: 'var(--text-secondary)',
  },
};

// Add hover styles via a style tag
const hoverStyle = document.createElement('style');
hoverStyle.textContent = `
  .need-card:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 32px rgba(201,147,58,0.15) !important;
    border-color: rgba(201,147,58,0.4) !important;
  }
`;
if (typeof document !== 'undefined' && !document.querySelector('#need-card-hover')) {
  hoverStyle.id = 'need-card-hover';
  document.head.appendChild(hoverStyle);
}

export default NeedCard;
