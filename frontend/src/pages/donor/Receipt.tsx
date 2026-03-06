import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Shield, Copy, Check, Mail, Search, Heart, ArrowRight } from 'lucide-react';
import type { Need } from '../../types';

// ─── SHA-256 via Web Crypto API (no external library) ────────────────────────
async function sha256Hex(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface LocationState {
  amount?: number;
  proofId?: string;
  need?: Need;
}

const Receipt: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [hash, setHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [hashReady, setHashReady] = useState(false);

  const proofId = state?.proofId || id || '';
  const amount = state?.amount || 0;
  const need = state?.need;
  const now = new Date();

  useEffect(() => {
    const payload = JSON.stringify({
      proofId,
      amount,
      needId: need?.id || '',
      timestamp: now.toISOString().split('T')[0],
      platform: 'IHSAN',
    });
    sha256Hex(payload).then(h => {
      setHash(h);
      setHashReady(true);
    });
  }, [proofId, amount]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = hash;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Success header */}
        <div style={styles.successHeader}>
          <div style={styles.checkIcon}>
            <CheckCircle size={32} style={{ color: '#6ec995' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
            Don confirmé
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Votre contribution a été enregistrée avec succès
          </p>
        </div>

        <hr className="gold-line" style={{ margin: '1.5rem 0' }} />

        {/* Receipt details */}
        <div style={styles.details}>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>ID de la preuve</span>
            <code style={styles.detailCode}>#{proofId.slice(0, 12)}…</code>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Besoin financé</span>
            <span style={styles.detailValue}>{need?.title || '—'}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Montant</span>
            <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '1.1rem' }}>
              {amount.toLocaleString('fr-MR')} MRU
            </span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Date</span>
            <span style={styles.detailValue}>
              {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Heure</span>
            <span style={styles.detailValue}>
              {now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Hash section */}
        <div style={styles.hashSection}>
          <div style={styles.hashLabel}>
            <Shield size={13} style={{ display: 'inline', marginRight: '0.4rem' }} />
            Hash SHA-256 — Preuve d'authenticité immuable
          </div>
          {hashReady ? (
            <>
              <code style={styles.hashValue}>{hash}</code>
              <button
                className="btn btn-outline btn-sm"
                style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                onClick={handleCopy}
              >
                {copied ? <><Check size={14} /> Copié dans le presse-papier</> : <><Copy size={14} /> Copier le hash complet</>}
              </button>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                Généré avec Web Crypto API (SHA-256). Vérifiable sur le tableau de bord public.
              </p>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div className="spinner" style={{ width: 24, height: 24 }} />
            </div>
          )}
        </div>

        {/* What's next */}
        <div style={styles.nextSteps}>
          <div style={styles.nextTitle}>Prochaines étapes</div>
          <div style={styles.nextItem}>
            <span style={styles.nextIcon}><Mail size={15} style={{ color: 'var(--gold)' }} /></span>
            <span>Vous serez notifié dès que la remise est confirmée.</span>
          </div>
          <div style={styles.nextItem}>
            <span style={styles.nextIcon}><Search size={15} style={{ color: 'var(--gold)' }} /></span>
            <span>Votre hash sera vérifiable publiquement sur le tableau de bord.</span>
          </div>
          <div style={styles.nextItem}>
            <span style={styles.nextIcon}><ArrowRight size={15} style={{ color: 'var(--gold)' }} /></span>
            <span>Le Validateur terrain va remettre l'aide et photographier la preuve.</span>
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <Link to="/my-donations" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Heart size={14} /> Voir mes dons
          </Link>
          <Link to="/catalog" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
            Catalogue
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem 1rem',
    background: 'radial-gradient(ellipse at 50% 0%, rgba(45,122,79,0.06) 0%, transparent 60%)',
  },
  card: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 16, padding: '2.5rem',
    width: '100%', maxWidth: 520,
    boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
  },
  successHeader: { textAlign: 'center', marginBottom: '0.5rem' },
  checkIcon: {
    width: 72, height: 72, borderRadius: '50%',
    background: 'rgba(45,122,79,0.12)', border: '2px solid rgba(110,201,149,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1rem',
  },
  details: {
    background: 'var(--bg)', borderRadius: 10, padding: '1.25rem', marginBottom: '1.25rem',
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
  },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' },
  detailLabel: { color: 'var(--text-secondary)', fontSize: '0.82rem', flexShrink: 0 },
  detailValue: { fontSize: '0.9rem', color: 'var(--text)', textAlign: 'right' },
  detailCode: { fontFamily: '"Courier New", monospace', color: 'var(--gold)', fontSize: '0.8rem' },
  hashSection: {
    background: 'rgba(201,147,58,0.05)', border: '1px solid rgba(201,147,58,0.2)',
    borderRadius: 10, padding: '1.25rem', marginBottom: '1.25rem',
  },
  hashLabel: { color: 'var(--gold)', fontSize: '0.82rem', marginBottom: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center' },
  hashValue: {
    display: 'block', fontFamily: '"Courier New", Courier, monospace',
    fontSize: '0.75rem', color: 'var(--text)', wordBreak: 'break-all',
    lineHeight: 1.6, background: 'rgba(0,0,0,0.2)', padding: '0.6rem 0.75rem', borderRadius: 6,
  },
  nextSteps: {
    background: 'var(--bg)', borderRadius: 10, padding: '1.25rem',
  },
  nextTitle: { color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' },
  nextItem: { display: 'flex', gap: '0.75rem', marginBottom: '0.6rem', fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.5, alignItems: 'flex-start' },
  nextIcon: { flexShrink: 0, marginTop: '0.1rem' },
};

export default Receipt;
