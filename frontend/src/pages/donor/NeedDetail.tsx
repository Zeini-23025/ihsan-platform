import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNeedById } from '../../service/needs.service';
import { addProof } from '../../service/proofs.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { Need } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import ProgressBar from '../../components/ProgressBar';
import MapView from '../../components/MapView';
import {
  Store, User, MapPin, Lock, Camera, Shield, Heart, CheckCircle,
  AlertCircle, Loader2, Smartphone, CreditCard, Landmark, ArrowLeft, Star
} from 'lucide-react';

const PAYMENT_METHODS = [
  { id: 'bankily', label: 'Bankily', icon: <Smartphone size={18} />, desc: 'Paiement mobile Mauritanien' },
  { id: 'masrivi', label: 'Masrivi', icon: <CreditCard size={18} />, desc: 'Portefeuille électronique' },
  { id: 'virement', label: 'Virement bancaire', icon: <Landmark size={18} />, desc: 'Transfert bancaire direct' },
];

const NeedDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [need, setNeed] = useState<Need | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bankily');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  useEffect(() => {
    if (!id) return;
    getNeedById(id)
      .then(setNeed)
      .catch(() => setError('Besoin introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFinanceClick = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setModalOpen(true);
  };

  const handlePay = async () => {
    if (!need || !id) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setPayError('Montant invalide'); return; }
    setPayError('');
    setPaying(true);
    try {
      const res = await addProof(id, amt);
      const proof = res.data as unknown as { id: string };
      addToast('Don confirmé avec succès !', 'success');
      navigate(`/receipt/${proof.id || id}`, { state: { amount: amt, need, proofId: proof.id } });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Erreur lors du paiement. Réessayez.';
      setPayError(msg);
      addToast(msg, 'error');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <div className="spinner" />
    </div>
  );

  if (error || !need) return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <AlertCircle size={48} style={{ color: 'var(--gold)', marginBottom: '1rem', opacity: 0.5 }} />
      <h2 style={{ marginBottom: '1rem' }}>{error || 'Besoin introuvable'}</h2>
      <button className="btn btn-ghost" style={{ marginTop: '1rem' }} onClick={() => navigate('/catalog')}>
        <ArrowLeft size={15} /> Retour au catalogue
      </button>
    </div>
  );

  const raised = need.amountRaised ?? 0;
  const canFinance = need.status === 'OPEN' || need.status === 'PENDING';

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Back */}
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <ArrowLeft size={14} /> Retour
      </button>

      <div style={styles.grid}>
        {/* Left */}
        <div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
            <StatusBadge status={need.status} />
            {need.partenaire && (
              <span style={styles.partnerTag}>
                <Store size={12} /> {need.partenaire.business_name}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', marginBottom: '1rem', lineHeight: 1.3 }}>
            {need.title}
          </h1>

          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            {need.description}
          </p>

          {/* Progress */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
            <ProgressBar raised={raised} total={need.amount} />
          </div>

          {/* Validator & Partner */}
          <div style={styles.metaGrid}>
            {need.validateur && (
              <div style={styles.metaCard}>
                <div style={styles.metaTitle}>
                  <User size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />
                  Validateur terrain
                </div>
                <div style={styles.metaValue}>{need.validateur.nom} {need.validateur.prenom}</div>
                {need.validateur.score !== undefined && (
                  <div style={{ color: 'var(--gold)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Star size={11} /> Score : {need.validateur.score}/100
                  </div>
                )}
              </div>
            )}
            {need.partenaire && (
              <div style={styles.metaCard}>
                <div style={styles.metaTitle}>
                  <Store size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />
                  Partenaire
                </div>
                <div style={styles.metaValue}>{need.partenaire.business_name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  {need.partenaire.business_type}
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          {need.approxLat && need.approxLng && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={13} style={{ color: 'var(--gold)' }} />
                Zone approximative (confidentialité préservée)
              </div>
              <MapView needs={[need]} height={280} center={[need.approxLat, need.approxLng]} zoom={14} />
            </div>
          )}
        </div>

        {/* Right — Finance panel */}
        <div>
          <div style={styles.financeBox}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={styles.financeLabel}>Objectif total</div>
              <div style={styles.financeAmount}>{need.amount?.toLocaleString('fr-MR')} MRU</div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={styles.financeLabel}>Déjà collecté</div>
              <div style={{ color: 'var(--text)', fontSize: '1.2rem', fontWeight: 600 }}>
                {raised.toLocaleString('fr-MR')} MRU
              </div>
            </div>

            <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Posté le {new Date(need.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleFinanceClick}
              disabled={!canFinance}
            >
              {canFinance
                ? <><Heart size={15} /> Financer ce besoin</>
                : <><CheckCircle size={15} /> Besoin clôturé</>
              }
            </button>

            {!isAuthenticated && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.75rem' }}>
                Vous serez redirigé vers la connexion
              </p>
            )}

            {/* Trust indicators */}
            <div style={styles.trust}>
              <div style={styles.trustItem}><Lock size={12} /> Paiement sécurisé</div>
              <div style={styles.trustItem}><Camera size={12} /> Preuve de remise garantie</div>
              <div style={styles.trustItem}><Shield size={12} /> Reçu SHA-256 immuable</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={18} style={{ color: 'var(--gold)' }} /> Financer ce besoin
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {need.title}
            </p>

            <div className="form-group">
              <label className="form-label">Montant (MRU)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={`Max: ${need.amount?.toLocaleString('fr-MR')} MRU`}
                min={1}
                max={need.amount}
              />
            </div>

            {/* Quick amounts */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {[250, 500, 1000, need.amount].filter(Boolean).map(a => (
                <button key={a} className="btn btn-ghost btn-sm" onClick={() => setAmount(String(a))}>
                  {a?.toLocaleString('fr-MR')} MRU
                </button>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Méthode de paiement</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {PAYMENT_METHODS.map(m => (
                  <label key={m.id} style={{ ...styles.methodOption, ...(method === m.id ? styles.methodSelected : {}) }}>
                    <input
                      type="radio" name="method" value={m.id}
                      checked={method === m.id} onChange={() => setMethod(m.id)}
                      style={{ width: 'auto', display: 'none' }}
                    />
                    <span style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center' }}>{m.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{m.label}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {payError && (
              <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={14} /> {payError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>
                Annuler
              </button>
              <button
                className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}
                onClick={handlePay} disabled={paying}
              >
                {paying
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Traitement…</>
                  : <><CheckCircle size={15} /> Confirmer le don</>
                }
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
              Simulation de paiement — Aucune donnée bancaire transmise
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr)',
    gap: '2rem', alignItems: 'start',
  },
  partnerTag: {
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    fontSize: '0.82rem', color: 'var(--text-secondary)',
    background: 'var(--card-hover)', padding: '0.2rem 0.65rem', borderRadius: 4, border: '1px solid var(--border)',
  },
  metaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' },
  metaCard: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '1rem',
  },
  metaTitle: { color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center' },
  metaValue: { fontWeight: 600, marginBottom: '0.2rem' },
  financeBox: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '1.5rem',
  },
  financeLabel: { color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' },
  financeAmount: { color: 'var(--gold)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem' },
  trust: { marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  trustItem: { fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' },
  methodOption: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.75rem 1rem', borderRadius: 8, cursor: 'pointer',
    border: '1.5px solid var(--border)', background: 'transparent',
    transition: 'all 0.2s',
  },
  methodSelected: {
    borderColor: 'var(--gold)', background: 'rgba(201,147,58,0.06)',
  },
};

// Responsive grid: 2 columns on md+
const needDetailStyle = document.createElement('style');
needDetailStyle.textContent = `
  @media (min-width: 768px) {
    .need-detail-grid { grid-template-columns: minmax(0,1fr) 300px !important; }
    .finance-box { position: sticky; top: 80px; }
  }
`;
if (typeof document !== 'undefined' && !document.querySelector('#need-detail-style')) {
  needDetailStyle.id = 'need-detail-style';
  document.head.appendChild(needDetailStyle);
}

export default NeedDetail;
