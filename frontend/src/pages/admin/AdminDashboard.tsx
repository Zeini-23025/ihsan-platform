import React, { useEffect, useState } from 'react';
import {
  User, Building2, Heart, ClipboardList, Shield, Trash2,
  Loader2, CheckCircle, EyeOff,
} from 'lucide-react';
import {
  getValidators, createValidator, deleteValidator,
  getPartners, createPartner, deletePartner,
  getDonors, deleteDonor,
  getAdminNeeds,
} from '../../service/admin.service';
import { useToast } from '../../context/ToastContext';
import type { Validateur, Partenaire, Need } from '../../types';
import StatusBadge from '../../components/StatusBadge';

type Tab = 'validators' | 'partners' | 'donors' | 'needs' | 'create';

type CreateRole = 'VALIDATEUR' | 'PARTENAIRE';

interface AnyUser {
  id: string;
  nom?: string;
  prenom?: string;
  email?: string;
  business_name?: string;
  role?: string;
  createdAt?: string;
}

const AdminDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [tab, setTab] = useState<Tab>('validators');
  const [validators, setValidators] = useState<Validateur[]>([]);
  const [partners, setPartners] = useState<Partenaire[]>([]);
  const [donors, setDonors] = useState<AnyUser[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loaded, setLoaded] = useState<Partial<Record<Tab, boolean>>>({});
  const [loadingTab, setLoadingTab] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createRole, setCreateRole] = useState<CreateRole>('VALIDATEUR');
  const [form, setForm] = useState({
    email: '', password: '', nom: '', prenom: '',
    business_name: '', business_type: 'RESTAURANT', address: '', description: '', NNI: '',
  });

  const loadTab = async (t: Tab) => {
    if (loaded[t]) return;
    setLoadingTab(true);
    try {
      if (t === 'validators') setValidators(await getValidators());
      else if (t === 'partners')   setPartners(await getPartners());
      else if (t === 'donors')     setDonors(await getDonors() as AnyUser[]);
      else if (t === 'needs')      setNeeds(await getAdminNeeds() as Need[]);
      setLoaded(prev => ({ ...prev, [t]: true }));
    } catch { /* silent */ }
    finally { setLoadingTab(false); }
  };

  useEffect(() => { loadTab(tab); }, [tab]);

  const handleDelete = async (id: string, role: string) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    setDeleting(id);
    try {
      if (role === 'VALIDATEUR') await deleteValidator(id);
      else if (role === 'PARTENAIRE') await deletePartner(id);
      else await deleteDonor(id);
      setValidators(prev => prev.filter(v => v.id !== id));
      setPartners(prev => prev.filter(p => p.id !== id));
      setDonors(prev => prev.filter(d => d.id !== id));
      addToast('Utilisateur supprimé.', 'success');
    } catch { addToast('Erreur lors de la suppression.', 'error'); }
    finally { setDeleting(null); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      if (createRole === 'VALIDATEUR') {
        await createValidator({ nom: form.nom, prenom: form.prenom, email: form.email, password: form.password, NNI: form.NNI });
      } else {
        await createPartner({ business_name: form.business_name, business_type: form.business_type, email: form.email, address: form.address, description: form.description, password: form.password });
      }
      addToast(`Compte ${createRole} créé avec succès.`, 'success');
      setForm({ email: '', password: '', nom: '', prenom: '', business_name: '', business_type: 'RESTAURANT', address: '', description: '', NNI: '' });
      setLoaded({});
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur.';
      addToast(msg, 'error');
    } finally { setCreating(false); }
  };

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'validators', label: 'Validateurs', icon: <User size={15} /> },
    { id: 'partners',   label: 'Partenaires', icon: <Building2 size={15} /> },
    { id: 'donors',     label: 'Donneurs',    icon: <Heart size={15} /> },
    { id: 'needs',      label: 'Besoins',     icon: <ClipboardList size={15} /> },
    { id: 'create',     label: 'Créer',       icon: <Shield size={15} /> },
  ];

  const renderUserTable = (users: AnyUser[], role: string) => (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            {role === 'PARTENAIRE' ? <th>Établissement</th> : <th>Prénom</th>}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td style={{ fontWeight: 600 }}>{u.nom || u.business_name || '—'}</td>
              <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.email || '—'}</td>
              <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {role === 'PARTENAIRE' ? u.business_name || '—' : u.prenom || '—'}
              </td>
              <td>
                <button
                  style={{ background: 'rgba(138,45,45,0.15)', color: '#e07070', border: '1px solid rgba(138,45,45,0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', borderRadius: 6, padding: '0.3rem 0.65rem', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.82rem' }}
                  onClick={() => handleDelete(u.id, role)}
                  disabled={deleting === u.id}
                >
                  {deleting === u.id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span style={styles.tag}>Administration</span>
        <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', marginTop: '0.5rem' }}>Tableau de bord admin</h1>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {TABS.map(t => (
          <button key={t.id} style={{ ...styles.tab, ...(tab === t.id ? styles.tabActive : {}) }} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loadingTab && <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" /></div>}

      {!loadingTab && tab === 'validators' && (
        <div>
          <h2 style={styles.tabTitle}>Validateurs <span style={{ color: 'var(--gold)' }}>({validators.length})</span></h2>
          {renderUserTable(validators as AnyUser[], 'VALIDATEUR')}
        </div>
      )}

      {!loadingTab && tab === 'partners' && (
        <div>
          <h2 style={styles.tabTitle}>Partenaires <span style={{ color: 'var(--gold)' }}>({partners.length})</span></h2>
          {renderUserTable(partners as AnyUser[], 'PARTENAIRE')}
        </div>
      )}

      {!loadingTab && tab === 'donors' && (
        <div>
          <h2 style={styles.tabTitle}>Donneurs <span style={{ color: 'var(--gold)' }}>({donors.length})</span></h2>
          {renderUserTable(donors, 'DONNEUR')}
        </div>
      )}

      {!loadingTab && tab === 'needs' && (
        <div>
          <h2 style={styles.tabTitle}>Besoins <span style={{ color: 'var(--gold)' }}>({needs.length})</span></h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Validateur</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {needs.map(n => (
                  <tr key={n.id}>
                    <td style={{ fontWeight: 600 }}>{n.title}</td>
                    <td style={{ color: 'var(--gold)' }}>{n.amount?.toLocaleString('fr-MR')} MRU</td>
                    <td><StatusBadge status={n.status} size="sm" /></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {n.validateur ? `${n.validateur.nom} ${n.validateur.prenom || ''}` : '—'}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(n.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loadingTab && tab === 'create' && (
        <div style={{ maxWidth: 520 }}>
          <h2 style={{ ...styles.tabTitle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} style={{ color: 'var(--gold)' }} /> Créer un compte
          </h2>

          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Rôle *</label>
              <select value={createRole} onChange={e => setCreateRole(e.target.value as CreateRole)}>
                <option value="VALIDATEUR">Validateur</option>
                <option value="PARTENAIRE">Partenaire</option>
              </select>
            </div>

            <div style={styles.twoCol}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email *</label>
                <input type="email" value={form.email} onChange={f('email')} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mot de passe *</label>
                <input type="password" value={form.password} onChange={f('password')} required minLength={8} />
              </div>
            </div>

            {createRole === 'VALIDATEUR' && (
              <>
                <div style={{ ...styles.twoCol, marginTop: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nom *</label>
                    <input value={form.nom} onChange={f('nom')} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Prénom *</label>
                    <input value={form.prenom} onChange={f('prenom')} required />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">NNI *</label>
                  <input value={form.NNI} onChange={f('NNI')} required placeholder="Numéro National d'Identité" />
                </div>
              </>
            )}

            {createRole === 'PARTENAIRE' && (
              <>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Nom de l'établissement *</label>
                  <input value={form.business_name} onChange={f('business_name')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Type *</label>
                  <select value={form.business_type} onChange={f('business_type')}>
                    <option value="RESTAURANT">Restaurant</option>
                    <option value="ONG">ONG</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Adresse *</label>
                  <input value={form.address} onChange={f('address')} required />
                </div>
              </>
            )}

            <div style={styles.privacyNote}>
              <EyeOff size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Communiquez le mot de passe de façon sécurisée — il ne sera plus visible après création.
              </span>
            </div>

            <button type="submit" className="btn btn-primary" disabled={creating} style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
              {creating
                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Création…</>
                : <><CheckCircle size={15} /> Créer le compte {createRole}</>
              }
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  tag: { color: 'var(--gold)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em' },
  tabs: {
    display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
    marginBottom: '1.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem',
  },
  tab: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.5rem 1.1rem', borderRadius: 8,
    border: '1px solid var(--border)', background: 'transparent',
    color: 'var(--text-secondary)', fontSize: '0.88rem',
    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Georgia, serif',
  },
  tabActive: { background: 'rgba(201,147,58,0.1)', borderColor: 'var(--gold)', color: 'var(--gold)' },
  tabTitle: { fontSize: '1.05rem', marginBottom: '1rem' },
  twoCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  privacyNote: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.6rem 0.85rem', marginTop: '1rem',
    background: 'rgba(201,147,58,0.05)', border: '1px solid rgba(201,147,58,0.15)', borderRadius: 6,
  },
};

export default AdminDashboard;
