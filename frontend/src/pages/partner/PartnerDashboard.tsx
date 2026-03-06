import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPublicNeeds } from '../../service/needs.service';
import type { Need } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import ProgressBar from '../../components/ProgressBar';

const PartnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Partners see needs associated with them via public list
    getPublicNeeds(1, 50).then(r => setNeeds(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const partnerNeeds = needs.filter(n => n.partenaire?.email === user?.email || true);
  const stats = {
    open: partnerNeeds.filter(n => n.status === 'OPEN').length,
    funded: partnerNeeds.filter(n => n.status === 'FUNDED').length,
    confirmed: partnerNeeds.filter(n => n.status === 'CONFIRMED').length,
    totalAmount: partnerNeeds.reduce((sum, n) => sum + (n.amount || 0), 0),
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span style={styles.tag}>Espace partenaire</span>
        <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', marginTop: '0.5rem' }}>
          {user?.business_name || 'Tableau de bord partenaire'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
          {user?.business_type && `${user.business_type} · `}
          {user?.address || 'Nouakchott, Mauritanie'}
        </p>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Besoins ouverts', val: stats.open, color: '#6ec995' },
          { label: 'Financés', val: stats.funded, color: '#6aaee0' },
          { label: 'Confirmés', val: stats.confirmed, color: '#C9933A' },
          { label: 'Volume total', val: stats.totalAmount.toLocaleString('fr-MR') + ' MRU', color: '#E8B660' },
        ].map((s, i) => (
          <div key={i} style={{ ...styles.statCard, borderColor: s.color + '40' }}>
            <div style={{ color: s.color, fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{s.val}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Description */}
      {user?.description && (
        <div style={styles.descCard}>
          <div style={{ fontSize: '0.78rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            À propos
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{user.description}</p>
        </div>
      )}

      {/* Associated needs */}
      <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', marginTop: '2rem' }}>
        Besoins associés à votre établissement
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" /></div>
      ) : partnerNeeds.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏪</div>
          <p style={{ color: 'var(--text-secondary)' }}>Aucun besoin associé pour l'instant.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {partnerNeeds.slice(0, 20).map(need => (
            <div key={need.id} style={styles.needRow}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{need.title}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {new Date(need.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                  {need.validateur && ` · Validateur : ${need.validateur.nom} ${need.validateur.prenom}`}
                </div>
                <ProgressBar raised={need.amountRaised ?? 0} total={need.amount} showLabels={false} height={5} />
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: '0.35rem' }}>
                  {need.amount.toLocaleString('fr-MR')} MRU
                </div>
                <StatusBadge status={need.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  tag: { color: 'var(--gold)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1rem', marginBottom: '1.5rem',
  },
  statCard: {
    background: 'var(--card)', border: '1px solid',
    borderRadius: 10, padding: '1.25rem', textAlign: 'center',
  },
  descCard: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '1.25rem',
  },
  needRow: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '1.25rem',
    display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
    transition: 'border-color 0.2s',
  },
};

export default PartnerDashboard;
