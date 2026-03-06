import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, LayoutGrid, Map, ClipboardList, LogIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPublicNeeds } from '../../service/needs.service';
import { useAuth } from '../../context/AuthContext';
import type { Need, NeedStatus } from '../../types';
import NeedCard from '../../components/NeedCard';
import MapView from '../../components/MapView';

const CITIES = ['', 'Tevragh Zeina', 'El Mina', 'Dar Naim', 'Toujounine', 'Ksar', 'Sebkha', 'Riyad', 'Arafat'];
const STATUSES: { label: string; value: NeedStatus | '' }[] = [
  { label: 'Tous', value: '' },
  { label: 'Ouverts', value: 'OPEN' },
  { label: 'Financés', value: 'FUNDED' },
  { label: 'En cours', value: 'DELIVERING' },
  { label: 'Confirmés', value: 'CONFIRMED' },
];

const Catalog: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [city, setCity] = useState('');
  const [status, setStatus] = useState<NeedStatus | ''>('');
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const limit = 12;

  useEffect(() => {
    setLoading(true);
    getPublicNeeds(page, limit, city || undefined, status || undefined)
      .then(r => { setNeeds(r.data); setTotal(r.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, city, status]);

  const handleFinance = (need: Need) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    navigate(`/needs/${need.id}`);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={styles.tag}>Catalogue</span>
        <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', marginTop: '0.5rem' }}>
          Besoins en cours
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {total} besoin{total !== 1 ? 's' : ''} référencé{total !== 1 ? 's' : ''} sur la plateforme
        </p>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={{ position: 'relative', flex: '1 1 150px', minWidth: 150, maxWidth: 220 }}>
          <MapPin size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <select value={city} onChange={e => { setCity(e.target.value); setPage(1); }} style={{ paddingLeft: '2.25rem', background: 'var(--bg)', color: 'var(--text)' }}>
            <option value="">Toutes les villes</option>
            {CITIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={styles.statusGroup}>
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => { setStatus(s.value as NeedStatus | ''); setPage(1); }}
              style={{ ...styles.filterBtn, ...(status === s.value ? styles.filterBtnActive : {}) }}
            >{s.label}</button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => setView('grid')}
            style={{ ...styles.viewBtn, ...(view === 'grid' ? styles.viewBtnActive : {}) }}
            title="Vue grille"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView('map')}
            style={{ ...styles.viewBtn, ...(view === 'map' ? styles.viewBtnActive : {}) }}
            title="Vue carte"
          >
            <Map size={16} />
          </button>
        </div>
      </div>

      {/* Map view */}
      {view === 'map' && (
        <div style={{ marginBottom: '2rem' }}>
          <MapView needs={needs} height={420} />
        </div>
      )}

      {/* Grid view */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner" />
        </div>
      ) : needs.length === 0 ? (
        <div style={styles.empty}>
          <ClipboardList size={48} style={{ color: 'rgba(201,147,58,0.3)', marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>Aucun besoin trouvé</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Essayez de modifier vos filtres</p>
        </div>
      ) : (
        <div className="grid-3">
          {needs.map(need => (
            <NeedCard
              key={need.id}
              need={need}
              onFinance={() => handleFinance(need)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            className="btn btn-ghost btn-sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <ChevronLeft size={14} /> Précédent
          </button>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Page {page} / {totalPages}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          >
            Suivant <ChevronRight size={14} />
          </button>
        </div>
      )}

      {!isAuthenticated && (
        <div style={styles.ctaBanner}>
          <p style={{ color: 'var(--text)', marginBottom: '0.75rem' }}>
            Connectez-vous pour financer un besoin et recevoir votre reçu SHA-256
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <LogIn size={15} /> Se connecter / S'inscrire
          </button>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  tag: { color: 'var(--gold)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em' },
  filters: {
    display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center',
    marginBottom: '1.5rem', padding: '1rem', background: 'var(--card)',
    border: '1px solid var(--border)', borderRadius: 10,
  },
  statusGroup: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  filterBtn: {
    padding: '0.35rem 0.85rem', borderRadius: 999,
    border: '1px solid var(--border)', background: 'transparent',
    color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer',
    transition: 'all 0.2s', fontFamily: 'Georgia, serif',
  },
  filterBtnActive: {
    background: 'rgba(201,147,58,0.12)', borderColor: 'var(--gold)',
    color: 'var(--gold)',
  },
  viewBtn: {
    padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
    transition: 'all 0.2s', display: 'flex', alignItems: 'center',
  },
  viewBtnActive: { borderColor: 'var(--gold)', color: 'var(--gold)', background: 'rgba(201,147,58,0.08)' },
  empty: {
    textAlign: 'center', padding: '4rem 2rem',
    background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)',
  },
  pagination: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: '1.5rem', marginTop: '2.5rem', padding: '1.5rem 0',
  },
  ctaBanner: {
    marginTop: '3rem', padding: '2rem', textAlign: 'center',
    background: 'rgba(201,147,58,0.06)', border: '1px solid rgba(201,147,58,0.2)',
    borderRadius: 12,
  },
};

export default Catalog;
