import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Shield, Loader2, ArrowLeft } from 'lucide-react';
import { createNeed } from '../../service/needs.service';
import { useToast } from '../../context/ToastContext';
import type { NeedCreateRequest } from '../../types';

const NOUAKCHOTT_ZONES = [
  { name: 'Tevragh Zeina', lat: 18.094, lng: -15.977 },
  { name: 'El Mina', lat: 18.069, lng: -16.014 },
  { name: 'Dar Naim', lat: 18.116, lng: -15.966 },
  { name: 'Toujounine', lat: 18.139, lng: -15.920 },
  { name: 'Ksar', lat: 18.079, lng: -15.993 },
  { name: 'Sebkha', lat: 18.063, lng: -15.983 },
  { name: 'Riyadh', lat: 18.087, lng: -15.955 },
  { name: 'Arafat', lat: 18.049, lng: -15.957 },
];

const CreateNeed: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    zone: NOUAKCHOTT_ZONES[0].name,
    email_partenaire: '',
    beneficiary_name: '',
    phone_beneficiary: '',
    email_beneficiary: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const zone = NOUAKCHOTT_ZONES.find(z => z.name === form.zone) || NOUAKCHOTT_ZONES[0];
      const data: NeedCreateRequest = {
        title: form.title,
        description: form.description,
        amount: parseFloat(form.amount) || 0,
        approxLat: zone.lat + (Math.random() * 0.01 - 0.005),
        approxLng: zone.lng + (Math.random() * 0.01 - 0.005),
        exactLat: zone.lat,
        exactLng: zone.lng,
        email_partenaire: form.email_partenaire,
        beneficiary_name: form.beneficiary_name,
        // Backend expects integer for phone
        phone_beneficiary: parseInt(form.phone_beneficiary.replace(/\D/g, ''), 10) as unknown as string,
        // email_beneficiary is required by backend even though optional in UI
        email_beneficiary: form.email_beneficiary || form.email_partenaire,
      };
      await createNeed(data);
      addToast('Besoin publié avec succès !', 'success');
      navigate('/validator');
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = (err as any)?.response?.data;
      const errorsArr = Array.isArray(raw) ? raw : raw?.errors;
      let msg = 'Erreur lors de la création du besoin.';
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

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={14} /> Retour
        </button>

        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardList size={22} style={{ color: 'var(--gold)' }} /> Publier un besoin
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Renseignez les informations du besoin identifié sur le terrain.
        </p>

        {/* Privacy notice */}
        <div style={styles.privacyNotice}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <Shield size={15} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <strong style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>Confidentialité absolue</strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Les données du bénéficiaire (nom, téléphone, email) ne seront jamais affichées publiquement.
                Seul l'administrateur y a accès.
              </p>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Public info */}
          <h3 style={styles.sectionTitle}>Informations publiques</h3>

          <div className="form-group">
            <label className="form-label">Titre du besoin *</label>
            <input
              name="title" value={form.title} onChange={handleChange}
              placeholder="Ex: 5 repas Iftar pour une famille de 5 personnes"
              required maxLength={120}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              placeholder="Décrivez la situation sans identifier le bénéficiaire..."
              rows={4} required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={styles.twoCol}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Zone / Quartier *</label>
              <select name="zone" value={form.zone} onChange={handleChange}>
                {NOUAKCHOTT_ZONES.map(z => <option key={z.name} value={z.name}>{z.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Montant nécessaire (MRU)</label>
              <input
                type="number" name="amount" value={form.amount} onChange={handleChange}
                placeholder="Ex: 1250" min={1}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Email du partenaire (restaurant/ONG) *</label>
            <input
              type="email" name="email_partenaire" value={form.email_partenaire} onChange={handleChange}
              placeholder="albaraka@example.com" required
            />
          </div>

          {/* Private beneficiary info */}
          <h3 style={{ ...styles.sectionTitle, marginTop: '2rem' }}>Données du bénéficiaire (confidentielles)</h3>

          <div className="form-group">
            <label className="form-label">Nom complet du bénéficiaire *</label>
            <input
              name="beneficiary_name" value={form.beneficiary_name} onChange={handleChange}
              placeholder="Nom — jamais affiché publiquement" required
            />
          </div>

          <div style={styles.twoCol}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Téléphone *</label>
              <input
                name="phone_beneficiary" value={form.phone_beneficiary} onChange={handleChange}
                placeholder="+222 XX XX XX XX" required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email (optionnel)</label>
              <input
                type="email" name="email_beneficiary" value={form.email_beneficiary} onChange={handleChange}
                placeholder="optionnel"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)} style={{ flex: 1 }}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
              {loading
                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Publication…</>
                : <><ClipboardList size={15} /> Publier ce besoin</>
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
    width: '100%', maxWidth: 620, height: 'fit-content',
  },
  sectionTitle: {
    color: 'var(--gold)', fontSize: '0.82rem', textTransform: 'uppercase',
    letterSpacing: '0.08em', marginBottom: '1rem', marginTop: '0.5rem',
    paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)',
  },
  privacyNotice: {
    background: 'rgba(201,147,58,0.06)', border: '1px solid rgba(201,147,58,0.2)',
    borderRadius: 8, padding: '0.85rem 1rem', marginBottom: '1.25rem',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
};

export default CreateNeed;
