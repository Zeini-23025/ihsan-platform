import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, ClipboardList, Plus } from 'lucide-react';
import { getValidatorNeeds } from '../../service/needs.service';
import { useAuth } from '../../context/AuthContext';
import type { Need } from '../../types';
import NeedCard from '../../components/NeedCard';

const ValidatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'OPEN' | 'FUNDED' | 'DELIVERING' | 'CONFIRMED'>('all');

  useEffect(() => {
    getValidatorNeeds(1, 50)
      .then(r => setNeeds(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? needs : needs.filter(n => n.status === filter);
  const stats = {
    open: needs.filter(n => n.status === 'OPEN').length,
    funded: needs.filter(n => n.status === 'FUNDED').length,
    delivering: needs.filter(n => n.status === 'DELIVERING').length,
    confirmed: needs.filter(n => n.status === 'CONFIRMED').length,
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span style={styles.tag}>Espace validateur</span>
          <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', marginTop: '0.5rem' }}>
            Bonjour {user?.nom || 'Validateur'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            Gérez les besoins que vous avez identifiés sur le terrain.
          </p>
        </div>
        <Link to="/validator/new-need" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <Plus size={15} /> Publier un besoin
        </Link>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Ouverts', val: stats.open, color: '#6ec995', bg: 'rgba(45,122,79,0.12)' },
          { label: 'Financés', val: stats.funded, color: '#6aaee0', bg: 'rgba(45,95,138,0.12)' },
          { label: 'En livraison', val: stats.delivering, color: '#E8B660', bg: 'rgba(168,117,42,0.12)' },
          { label: 'Confirmés', val: stats.confirmed, color: '#C9933A', bg: 'rgba(201,147,58,0.12)' },
        ].map((s, i) => (
          <div key={i} style={{ ...styles.statCard, background: s.bg, borderColor: s.color + '40' }}>
            <div style={{ color: s.color, fontSize: '1.6rem', fontWeight: 700 }}>{s.val}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {(['all', 'OPEN', 'FUNDED', 'DELIVERING', 'CONFIRMED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}
          >
            {f === 'all' ? 'Tous' : f === 'OPEN' ? 'Ouverts' : f === 'FUNDED' ? 'Financés' : f === 'DELIVERING' ? 'En cours' : 'Confirmés'}
          </button>
        ))}
      </div>

      {/* Needs list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <ClipboardList size={48} style={{ color: 'rgba(201,147,58,0.3)', marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>Aucun besoin</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Publiez votre premier besoin identifié sur le terrain.
          </p>
          <Link to="/validator/new-need" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={14} /> Publier un besoin
          </Link>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(need => (
            <div key={need.id} style={{ position: 'relative' }}>
              <NeedCard need={need} />
              {(need.status === 'FUNDED' || need.status === 'DELIVERING') && (
                <button
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={() => navigate(`/validator/confirm/${need.id}`)}
                >
                  <Camera size={13} /> Confirmer la remise
                </button>
              )}
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
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '1rem', marginBottom: '2rem',
  },
  statCard: {
    borderRadius: 10, padding: '1rem 1.25rem', border: '1px solid',
    textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem',
  },
  filterBtn: {
    padding: '0.35rem 0.85rem', borderRadius: 999,
    border: '1px solid var(--border)', background: 'transparent',
    color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer',
    transition: 'all 0.2s', fontFamily: 'Georgia, serif',
  },
  filterActive: { background: 'rgba(201,147,58,0.1)', borderColor: 'var(--gold)', color: 'var(--gold)' },
  empty: {
    textAlign: 'center', padding: '4rem',
    background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)',
  },
};

export default ValidatorDashboard;
