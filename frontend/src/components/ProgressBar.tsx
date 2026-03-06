import React from 'react';

interface ProgressBarProps {
  raised: number;
  total: number;
  showLabels?: boolean;
  height?: number;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  raised,
  total,
  showLabels = true,
  height = 8,
  animated = true,
}) => {
  const pct = total > 0 ? Math.min(100, Math.round((raised / total) * 100)) : 0;

  return (
    <div style={{ width: '100%' }}>
      {showLabels && (
        <div style={styles.labels}>
          <span style={styles.raised}>
            {raised.toLocaleString('fr-MR')} MRU collectés
          </span>
          <span style={styles.pct}>{pct}%</span>
        </div>
      )}
      <div style={{ ...styles.track, height }}>
        <div
          style={{
            ...styles.fill,
            width: `${pct}%`,
            height: '100%',
            animation: animated ? 'progressFill 1s ease-out' : 'none',
          }}
        />
      </div>
      {showLabels && (
        <div style={styles.total}>
          Objectif : {total.toLocaleString('fr-MR')} MRU
        </div>
      )}

      <style>{`
        @keyframes progressFill {
          from { width: 0; }
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  labels: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '0.4rem',
  },
  raised: { font: 'inherit', fontSize: '0.88rem', color: 'var(--gold)', fontWeight: 600 },
  pct: { fontSize: '0.85rem', color: 'var(--text-secondary)' },
  track: {
    width: '100%', background: 'var(--border)', borderRadius: 999, overflow: 'hidden',
  },
  fill: {
    background: 'linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-light))',
    borderRadius: 999,
    transition: 'width 0.5s ease',
    boxShadow: '0 0 8px rgba(201,147,58,0.4)',
  },
  total: { marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' },
};

export default ProgressBar;
