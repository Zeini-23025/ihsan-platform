import React, { useEffect, useState } from 'react';
import { Banknote, CheckCircle, Users, Search, Loader2, ClipboardList } from 'lucide-react';
import { getPublicNeeds } from '../../service/needs.service';
import type { Need } from '../../types';
import HashDisplay from '../../components/HashDisplay';
import StatusBadge from '../../components/StatusBadge';
import api from '../../service/api';

const PublicDashboard: React.FC = () => {
  const [confirmedNeeds, setConfirmedNeeds] = useState<Need[]>([]);
  const [stats, setStats] = useState({ totalRaised: 0, confirmedNeeds: 0, activeValidators: 0 });
  const [hashInput, setHashInput] = useState('');
  const [hashResult, setHashResult] = useState<null | { valid: boolean; message: string }>(null);
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getPublicNeeds(1, 20, undefined, 'CONFIRMED'),
      api.get('/public/stats').catch(() => ({ data: {} })),
    ]).then(([needsRes, statsRes]) => {
      setConfirmedNeeds(needsRes.data);
      const d = statsRes.data?.data || statsRes.data;
      setStats({
        totalRaised: d?.totalCollected || d?.totalRaised || 0,
        confirmedNeeds: d?.confirmedNeeds || d?.confirmed_needs || needsRes.total || 0,
        activeValidators: d?.activeValidators || 0,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const verifyHash = async () => {
    if (!hashInput.trim()) return;
    setVerifying(true);
    setHashResult(null);
    try {
      const res = await api.get(`/public/verify-hash/${hashInput.trim()}`);
      const found = res.data?.data || res.data;
      if (found) {
        setHashResult({ valid: true, message: `Transaction vérifiée — Montant : ${found.amount?.toLocaleString('fr-MR')} MRU` });
      } else {
        setHashResult({ valid: false, message: 'Hash non trouvé dans le registre IHSAN.' });
      }
    } catch {
      const found = confirmedNeeds.find(n => n.id === hashInput.trim());
      if (found) {
        setHashResult({ valid: true, message: `Besoin trouvé : "${found.title}"` });
      } else {
        setHashResult({ valid: false, message: 'Hash non reconnu. Vérifiez la valeur et réessayez.' });
      }
    } finally {
      setVerifying(false);
    }
  };

  const STATS_ITEMS = [
    { val: stats.totalRaised.toLocaleString('fr-MR') + ' MRU', label: 'Total collecté', icon: <Banknote size={22} style={{ color: 'var(--gold)' }} /> },
    { val: stats.confirmedNeeds.toString(), label: 'Besoins confirmés', icon: <CheckCircle size={22} style={{ color: 'var(--gold)' }} /> },
    { val: stats.activeValidators.toString(), label: 'Validateurs', icon: <Users size={22} style={{ color: 'var(--gold)' }} /> },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span style={styles.tag}>Transparence publique</span>
        <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', marginTop: '0.5rem' }}>
          Tableau de bord public
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Toutes les transactions sont visibles et vérifiables par n'importe qui.
        </p>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {STATS_ITEMS.map((s, i) => (
          <div key={i} style={styles.statCard}>
            <div style={{ marginBottom: '0.5rem' }}>{s.icon}</div>
            <div style={styles.statVal}>{s.val || '—'}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Hash verifier */}
      <div style={styles.verifier}>
        <h2 style={{ marginBottom: '0.75rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} style={{ color: 'var(--gold)' }} /> Vérifier un hash SHA-256
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Entrez un hash SHA-256 pour confirmer l'authenticité d'une transaction IHSAN.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            value={hashInput}
            onChange={e => setHashInput(e.target.value)}
            placeholder="Entrez un hash SHA-256 ou un ID de transaction..."
            style={{ flex: 1, minWidth: 200, fontFamily: '"Courier New", monospace', fontSize: '0.85rem' }}
            onKeyDown={e => e.key === 'Enter' && verifyHash()}
          />
          <button className="btn btn-primary" onClick={verifyHash} disabled={verifying || !hashInput.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            {verifying
              ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Vérification…</>
              : <><Search size={15} /> Vérifier</>
            }
          </button>
        </div>
        {hashResult && (
          <div className={`alert ${hashResult.valid ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {hashResult.valid
              ? <CheckCircle size={14} />
              : <Search size={14} style={{ opacity: 0.7 }} />
            }
            {hashResult.message}
          </div>
        )}
      </div>

      {/* Confirmed needs list */}
      <div style={{ marginTop: '2.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>
          Derniers besoins confirmés
          {confirmedNeeds.length > 0 && (
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 400, marginLeft: '0.5rem' }}>
              ({confirmedNeeds.length})
            </span>
          )}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : confirmedNeeds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <ClipboardList size={40} style={{ color: 'rgba(201,147,58,0.3)', marginBottom: '0.75rem' }} />
            <p>Aucun besoin confirmé pour l'instant.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Besoin</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Validateur</th>
                  <th>ID / Hash</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {confirmedNeeds.map(need => (
                  <tr key={need.id}>
                    <td style={{ fontWeight: 600 }}>{need.title}</td>
                    <td style={{ color: 'var(--gold)' }}>{need.amount?.toLocaleString('fr-MR')} MRU</td>
                    <td><StatusBadge status={need.status} size="sm" /></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {need.validateur ? `${need.validateur.nom} ${need.validateur.prenom}` : '—'}
                    </td>
                    <td><HashDisplay hash={need.id} maxLength={16} /></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      {new Date(need.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  tag: { color: 'var(--gold)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1.5rem', marginBottom: '2.5rem',
  },
  statCard: {
    background: 'var(--card)', border: '1px solid rgba(201,147,58,0.15)',
    borderRadius: 12, padding: '2rem', textAlign: 'center',
    boxShadow: '0 4px 24px rgba(201,147,58,0.06)',
  },
  statVal: { fontSize: '2rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '0.35rem' },
  verifier: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '1.75rem',
  },
};

export default PublicDashboard;
