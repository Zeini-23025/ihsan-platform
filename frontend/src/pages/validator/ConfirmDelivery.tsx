import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Upload, AlertCircle, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { completeNeed } from '../../service/needs.service';
import { useToast } from '../../context/ToastContext';

const ConfirmDelivery: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !id) return;
    if (!accepted) { setError("Veuillez confirmer que les visages sont anonymisés."); return; }
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('needId', id);
      await completeNeed(id, formData);
      addToast('Remise confirmée avec succès !', 'success');
      setSuccess(true);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = (err as any)?.response?.data;
      const errorsArr = Array.isArray(raw) ? raw : raw?.errors;
      let msg = 'Erreur lors de la confirmation. Réessayez.';
      if (errorsArr?.length) {
        msg = errorsArr.map((e: { field?: string; message: string }) =>
          e.field ? `${e.field}: ${e.message}` : e.message
        ).join(' | ');
      } else if (raw?.message) {
        msg = raw.message;
      }
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center' }}>
            <div style={styles.successIcon}>
              <CheckCircle size={36} style={{ color: '#6ec995' }} />
            </div>
            <h2 style={{ marginBottom: '0.75rem', color: 'var(--text)' }}>Remise confirmée !</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              La preuve de remise a été enregistrée. Le donneur sera notifié et pourra vérifier son hash sur le tableau de bord.
            </p>
            <p className="arabic" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              جَزَاكَ اللَّهُ خَيْرًا
            </p>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/validator')}>
              <ArrowLeft size={15} /> Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={14} /> Retour
        </button>

        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Camera size={22} style={{ color: 'var(--gold)' }} /> Confirmer la remise
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Uploadez la photo de preuve de remise. Besoin #{id?.slice(0, 8)}
        </p>

        {/* Anonymity requirement */}
        <div style={styles.warningBox}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <AlertCircle size={15} style={{ color: '#E8B660', flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <strong style={{ color: '#E8B660', fontSize: '0.88rem' }}>Exigence d'anonymisation</strong>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.35rem', paddingLeft: '1rem', lineHeight: 1.7 }}>
                <li>Les visages doivent être non visibles (flouté, masqué ou photographié de dos)</li>
                <li>Aucune donnée personnelle identifiable ne doit apparaître</li>
                <li>La photo sert uniquement de preuve de remise du bien</li>
              </ul>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Drop zone */}
          <div
            style={{ ...styles.dropZone, ...(preview ? styles.dropZoneWithPreview : {}) }}
            onClick={() => fileRef.current?.click()}
          >
            {preview ? (
              <div style={{ textAlign: 'center' }}>
                <img src={preview} alt="Aperçu" style={{ maxWidth: '100%', maxHeight: 280, borderRadius: 8, objectFit: 'contain' }} />
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '0.85rem' }}>
                  {file?.name} · Cliquez pour changer
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <Camera size={32} style={{ color: 'rgba(201,147,58,0.5)' }} />
                  <Upload size={32} style={{ color: 'rgba(201,147,58,0.5)' }} />
                </div>
                <p style={{ color: 'var(--text)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Glissez la photo ou cliquez pour sélectionner
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  JPG, PNG, WEBP · Max 10 MB · Visages non visibles obligatoire
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            required
          />

          {/* Confirmation checkbox */}
          <label style={styles.checkLabel}>
            <input
              type="checkbox"
              checked={accepted}
              onChange={e => setAccepted(e.target.checked)}
              style={{ width: 'auto' }}
            />
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Je confirme que la photo ne contient aucun visage identifiable et que la remise a bien eu lieu.
            </span>
          </label>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)} style={{ flex: 1 }}>
              Annuler
            </button>
            <button
              type="submit" className="btn btn-primary"
              disabled={loading || !file || !accepted}
              style={{ flex: 2, justifyContent: 'center' }}
            >
              {loading
                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Envoi…</>
                : <><CheckCircle size={15} /> Confirmer la remise</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex', justifyContent: 'center',
    padding: '2rem 1rem',
  },
  card: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 16, padding: '2rem',
    width: '100%', maxWidth: 540, height: 'fit-content',
  },
  warningBox: {
    background: 'rgba(168,117,42,0.1)', border: '1px solid rgba(232,182,96,0.3)',
    borderRadius: 8, padding: '0.85rem 1rem', marginBottom: '1.25rem',
  },
  dropZone: {
    border: '2px dashed var(--border)', borderRadius: 10,
    padding: '2.5rem 1.5rem', cursor: 'pointer', textAlign: 'center',
    transition: 'border-color 0.2s, background 0.2s', marginBottom: '1rem',
  },
  dropZoneWithPreview: {
    borderColor: 'var(--gold)', background: 'rgba(201,147,58,0.04)',
  },
  checkLabel: {
    display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer',
  },
  successIcon: {
    width: 80, height: 80, borderRadius: '50%',
    background: 'rgba(45,122,79,0.12)', border: '2px solid rgba(110,201,149,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1.5rem',
  },
};

export default ConfirmDelivery;
