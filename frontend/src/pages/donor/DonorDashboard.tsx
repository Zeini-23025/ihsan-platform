import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, ClipboardList, CheckCircle, Heart, Moon } from 'lucide-react';
import { getMyProofs } from '../../service/proofs.service';
import type { Proof } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import HashDisplay from '../../components/HashDisplay';

const SkeletonCard = () => (
  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
      <div>
        <div className="skeleton skeleton-text" style={{ width: 200, marginBottom: '0.5rem' }} />
        <div className="skeleton skeleton-text" style={{ width: 120, height: '0.8em' }} />
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="skeleton skeleton-text" style={{ width: 80 }} />
        <div className="skeleton" style={{ width: 60, height: 20, marginTop: '0.5rem', borderRadius: 999 }} />
      </div>
    </div>
    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
      <div className="skeleton" style={{ width: 160, height: 28, borderRadius: 6 }} />
      <div className="skeleton" style={{ width: 80, height: 28, borderRadius: 6 }} />
    </div>
  </div>
);

const DonorDashboard: React.FC = () => {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProofs()
      .then(setProofs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalGiven = proofs.reduce((sum, p) => sum + (p.amount || 0), 0);
  const confirmed = proofs.filter(p => p.need?.status === 'CONFIRMED').length;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={styles.tag}>Espace donneur</span>
        <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', marginTop: '0.5rem' }}>Mes dons</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Chaque don que vous avez fait est ici, traçable et vérifiable.
        </p>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <Banknote size={24} style={{ color: 'var(--gold)', marginBottom: '0.4rem' }} />
          <div style={styles.statVal}>{totalGiven.toLocaleString('fr-MR')} MRU</div>
          <div style={styles.statLabel}>Total donné</div>
        </div>
        <div style={styles.statCard}>
          <ClipboardList size={24} style={{ color: 'var(--gold)', marginBottom: '0.4rem' }} />
          <div style={styles.statVal}>{proofs.length}</div>
          <div style={styles.statLabel}>Dons effectués</div>
        </div>
        <div style={styles.statCard}>
          <CheckCircle size={24} style={{ color: 'var(--gold)', marginBottom: '0.4rem' }} />
          <div style={styles.statVal}>{confirmed}</div>
          <div style={styles.statLabel}>Remises confirmées</div>
        </div>
      </div>

      {/* Impact message */}
      {confirmed > 0 && (
        <div style={styles.impactBanner}>
          <Moon size={20} style={{ color: '#6ec995', flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--gold)' }}>Baraka !</strong>{' '}
            Grâce à vous, {confirmed} famille{confirmed > 1 ? 's ont' : ' a'} rompu le jeûne avec dignité.
          </div>
        </div>
      )}

      {/* Proofs list */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Historique des contributions</h2>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : proofs.length === 0 ? (
          <div style={styles.empty}>
            <Heart size={48} style={{ color: 'rgba(201,147,58,0.3)', marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Aucun don pour l'instant</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Parcourez le catalogue et financez un besoin précis.
            </p>
            <Link to="/catalog" className="btn btn-primary">Voir les besoins</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {proofs.map(proof => (
              <div key={proof.id} style={styles.proofCard}>
                <div style={styles.proofHeader}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                      {proof.need?.title || `Don #${proof.id.slice(0, 8)}`}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {new Date(proof.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '1.1rem' }}>
                      {proof.amount.toLocaleString('fr-MR')} MRU
                    </div>
                    {proof.need && (
                      <div style={{ marginTop: '0.3rem' }}>
                        <StatusBadge status={proof.need.status} size="sm" />
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <HashDisplay hash={proof.id} maxLength={24} />
                  {proof.need && (
                    <Link to={`/needs/${proof.need.id}`} className="btn btn-ghost btn-sm">
                      Voir le besoin
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  tag: { color: 'var(--gold)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1.25rem', marginBottom: '1.5rem',
  },
  statCard: {
    background: 'var(--card)', border: '1px solid rgba(201,147,58,0.15)',
    borderRadius: 12, padding: '1.5rem', textAlign: 'center',
    boxShadow: '0 4px 24px rgba(201,147,58,0.06)',
  },
  statVal: { fontSize: '1.8rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '0.3rem' },
  statLabel: { color: 'var(--text-secondary)', fontSize: '0.85rem' },
  impactBanner: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    background: 'rgba(45,122,79,0.1)', border: '1px solid rgba(110,201,149,0.25)',
    borderRadius: 10, padding: '1rem 1.25rem',
    color: 'var(--text)', fontSize: '0.92rem',
  },
  empty: {
    textAlign: 'center', padding: '3rem',
    background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)',
  },
  proofCard: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '1.25rem',
    transition: 'border-color 0.2s',
  },
  proofHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem',
  },
};

export default DonorDashboard;
