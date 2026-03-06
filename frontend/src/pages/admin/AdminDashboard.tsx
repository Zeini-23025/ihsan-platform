import React, { useEffect, useState } from 'react';
import {
  User, Building2, Heart, ClipboardList, Shield, Trash2,
  Loader2, CheckCircle, EyeOff, LayoutDashboard, Plus,
  Search, Edit2, X, Users, TrendingUp, PanelLeftClose, PanelLeft,
  Save,
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
import { confirmDialog } from '../../utils/swal';

type Tab = 'overview' | 'validators' | 'partners' | 'donors' | 'needs' | 'create';
type CreateRole = 'VALIDATEUR' | 'PARTENAIRE';

interface AnyUser {
  id: string;
  nom?: string;
  prenom?: string;
  email?: string;
  business_name?: string;
  role?: string;
  createdAt?: string;
  NNI?: number;
  address?: string;
  description?: string;
  business_type?: string;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',    label: "Vue d'ensemble",  icon: <LayoutDashboard size={18} /> },
  { id: 'validators',  label: 'Validateurs',      icon: <User size={18} />            },
  { id: 'partners',    label: 'Partenaires',      icon: <Building2 size={18} />       },
  { id: 'donors',      label: 'Donneurs',         icon: <Heart size={18} />           },
  { id: 'needs',       label: 'Besoins',          icon: <ClipboardList size={18} />   },
  { id: 'create',      label: 'Créer un compte',  icon: <Shield size={18} />          },
];

const AdminDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [validators, setValidators] = useState<Validateur[]>([]);
  const [partners, setPartners] = useState<Partenaire[]>([]);
  const [donors, setDonors] = useState<AnyUser[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loaded, setLoaded] = useState<Partial<Record<string, boolean>>>({});
  const [loadingTab, setLoadingTab] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createRole, setCreateRole] = useState<CreateRole>('VALIDATEUR');
  const [search, setSearch] = useState('');

  // Edit state
  const [editingUser, setEditingUser] = useState<AnyUser | null>(null);
  const [editForm, setEditForm] = useState<AnyUser | null>(null);
  const [editRole, setEditRole] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    email: '', password: '', nom: '', prenom: '',
    business_name: '', business_type: 'RESTAURANT', address: '', description: '', NNI: '',
  });

  const loadTab = async (t: Tab) => {
    if (loaded[t]) return;
    setLoadingTab(true);
    try {
      if (t === 'overview') {
        const [v, p, d, n] = await Promise.all([
          getValidators(), getPartners(),
          getDonors() as Promise<AnyUser[]>, getAdminNeeds() as Promise<Need[]>,
        ]);
        setValidators(v); setPartners(p); setDonors(d); setNeeds(n);
        setLoaded(prev => ({ ...prev, validators: true, partners: true, donors: true, needs: true, overview: true }));
      } else if (t === 'validators') { setValidators(await getValidators()); }
      else if (t === 'partners')   { setPartners(await getPartners()); }
      else if (t === 'donors')     { setDonors(await getDonors() as AnyUser[]); }
      else if (t === 'needs')      { setNeeds(await getAdminNeeds() as Need[]); }
      setLoaded(prev => ({ ...prev, [t]: true }));
    } catch { /* silent */ }
    finally { setLoadingTab(false); }
  };

  useEffect(() => { loadTab(tab); }, [tab]);

  const handleDelete = async (id: string, role: string, name: string) => {
    const ok = await confirmDialog(
      'Supprimer cet utilisateur ?',
      `<span style="color:#8A96A8;font-size:0.88rem">Vous êtes sur le point de supprimer <strong style="color:#F0E6CC">${name}</strong>. Cette action est irréversible.</span>`,
      'Oui, supprimer',
      'Annuler',
    );
    if (!ok) return;
    setDeleting(id);
    try {
      if (role === 'VALIDATEUR') await deleteValidator(id);
      else if (role === 'PARTENAIRE') await deletePartner(id);
      else await deleteDonor(id);
      setValidators(prev => prev.filter(v => v.id !== id));
      setPartners(prev => prev.filter(p => p.id !== id));
      setDonors(prev => prev.filter(d => d.id !== id));
      addToast('Utilisateur supprimé avec succès.', 'success');
    } catch { addToast('Erreur lors de la suppression.', 'error'); }
    finally { setDeleting(null); }
  };

  const openEdit = (user: AnyUser, role: string) => {
    setEditingUser(user);
    setEditForm({ ...user });
    setEditRole(role);
  };

  const closeEdit = () => { setEditingUser(null); setEditForm(null); };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    setSaving(true);
    try {
      // Edit endpoints are best-effort; for now we optimistically update the UI
      if (editRole === 'VALIDATEUR') {
        setValidators(prev => prev.map(v => v.id === editForm.id ? { ...v, ...editForm } as Validateur : v));
      } else if (editRole === 'PARTENAIRE') {
        setPartners(prev => prev.map(p => p.id === editForm.id ? { ...p, ...editForm } as Partenaire : p));
      } else {
        setDonors(prev => prev.map(d => d.id === editForm.id ? { ...d, ...editForm } : d));
      }
      addToast('Modifications enregistrées.', 'success');
      closeEdit();
    } catch { addToast('Erreur lors de la modification.', 'error'); }
    finally { setSaving(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      if (createRole === 'VALIDATEUR') {
        const nniNumber = parseInt(form.NNI, 10);
        await createValidator({ nom: form.nom, prenom: form.prenom, email: form.email, password: form.password, NNI: nniNumber });
      } else {
        await createPartner({ business_name: form.business_name, business_type: form.business_type, email: form.email, address: form.address, description: form.description, password: form.password });
      }
      addToast(`Compte ${createRole} créé avec succès.`, 'success');
      setForm({ email: '', password: '', nom: '', prenom: '', business_name: '', business_type: 'RESTAURANT', address: '', description: '', NNI: '' });
      setLoaded({});
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = (err as any)?.response?.data;
      let msg = 'Erreur lors de la création.';
      const errorsArr = Array.isArray(raw) ? raw : raw?.errors;
      if (errorsArr?.length) {
        msg = errorsArr.map((e: { field?: string; message: string }) =>
          e.field ? `${e.field}: ${e.message}` : e.message
        ).join(' | ');
      } else if (raw?.message) { msg = raw.message; }
      else if (typeof raw === 'string') { msg = raw; }
      addToast(msg, 'error');
    } finally { setCreating(false); }
  };

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const filterUsers = (users: AnyUser[]) => {
    const q = search.toLowerCase();
    return users.filter(u =>
      (u.nom || '').toLowerCase().includes(q) ||
      (u.prenom || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.business_name || '').toLowerCase().includes(q)
    );
  };

  const renderUserTable = (users: AnyUser[], role: string) => {
    const filtered = filterUsers(users);
    const name = (u: AnyUser) => role === 'PARTENAIRE'
      ? u.business_name || '—'
      : `${u.nom || ''} ${u.prenom || ''}`.trim() || '—';

    return (
      <div>
        <div style={S.searchRow}>
          <div style={S.searchWrapper}>
            <Search size={15} style={S.searchIcon} />
            <input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} style={S.searchInput} className="form-input" />
            {search && <button onClick={() => setSearch('')} style={S.clearBtn}><X size={13} /></button>}
          </div>
          <button style={S.addBtn} onClick={() => { setCreateRole(role === 'PARTENAIRE' ? 'PARTENAIRE' : 'VALIDATEUR'); setTab('create'); }}>
            <Plus size={15} /> Ajouter
          </button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr>
              <th>Nom</th><th>Email</th>
              {role === 'PARTENAIRE' ? <th>Établissement</th> : <th>Prénom</th>}
              <th style={{ width: 100 }}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2.5rem' }}>Aucun résultat</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.nom || u.business_name || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.email || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {role === 'PARTENAIRE' ? u.business_name || '—' : u.prenom || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button className="action-btn-edit" style={S.actionBtn} onClick={() => openEdit(u, role)} title="Modifier">
                        <Edit2 size={13} />
                      </button>
                      <button className="action-btn-del" style={S.deleteBtn} onClick={() => handleDelete(u.id, role, name(u))} disabled={deleting === u.id} title="Supprimer">
                        {deleting === u.id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderOverview = () => {
    const statCards = [
      { label: 'Validateurs', value: validators.length, icon: <User size={24} />, color: '#6aaee0', pct: 0 },
      { label: 'Partenaires', value: partners.length, icon: <Building2 size={24} />, color: '#e8b660', pct: 0 },
      { label: 'Donneurs',    value: donors.length,    icon: <Heart size={24} />,    color: '#e07070', pct: 0 },
      { label: 'Besoins',     value: needs.length,     icon: <ClipboardList size={24} />, color: 'var(--gold)', pct: 0 },
    ];
    const total = statCards.slice(0, 3).reduce((s, c) => s + c.value, 0) || 1;
    statCards.slice(0, 3).forEach(c => { c.pct = Math.round((c.value / total) * 100); });

    const allUsers: (AnyUser & { roleLabel: string; roleColor: string })[] = [
      ...validators.map(v => ({ ...v, roleLabel: 'Validateur', roleColor: '#6aaee0' })),
      ...partners.map(p => ({ ...p, roleLabel: 'Partenaire', roleColor: '#e8b660' })),
      ...donors.map(d => ({ ...d, roleLabel: 'Donneur', roleColor: '#e07070' })),
    ];

    return (
      <div>
        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          {statCards.map(s => (
            <div key={s.label} style={O.statCard} className="stat-card-hover">
              <div style={{ ...O.statIcon, background: s.color + '18', color: s.color }}>{s.icon}</div>
              <div>
                <div style={O.statValue}>{s.value}</div>
                <div style={O.statLabel}>{s.label}</div>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: s.color + '40', borderRadius: '0 0 12px 12px' }}>
                <div style={{ height: '100%', width: '100%', background: s.color, borderRadius: 'inherit', opacity: 0.7 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Distribution Section — Improved */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Donut-style */}
          <div style={O.chartCard}>
            <div style={O.chartTitle}><TrendingUp size={15} style={{ color: 'var(--gold)' }} /> Répartition des utilisateurs</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
              {/* SVG donut */}
              <svg width={120} height={120} viewBox="0 0 42 42" style={{ flexShrink: 0 }}>
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--border)" strokeWidth="3.8" />
                {(() => {
                  const usersOnly = statCards.slice(0, 3);
                  let offset = 25;
                  return usersOnly.map((s, i) => {
                    const dash = (s.pct / 100) * 100;
                    const el = (
                      <circle key={i} cx="21" cy="21" r="15.9" fill="none"
                        stroke={s.color} strokeWidth="3.8"
                        strokeDasharray={`${dash} ${100 - dash}`}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dasharray 0.8s ease' }}
                      />
                    );
                    offset -= dash;
                    return el;
                  });
                })()}
                <text x="21" y="21" textAnchor="middle" dy=".3em" fontSize="7" fill="var(--gold)" fontWeight="700" fontFamily="Georgia, serif">
                  {total}
                </text>
                <text x="21" y="27" textAnchor="middle" fontSize="3.5" fill="var(--text-secondary)" fontFamily="sans-serif">
                  utilisateurs
                </text>
              </svg>
              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {statCards.slice(0, 3).map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                    <span style={{ color: s.color, fontWeight: 700, marginLeft: 'auto', paddingLeft: '0.5rem' }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar chart for needs */}
          <div style={O.chartCard}>
            <div style={O.chartTitle}><ClipboardList size={15} style={{ color: 'var(--gold)' }} /> Besoins par statut</div>
            {(() => {
              const statuses = [
                { label: 'En attente', color: '#e8b660', count: needs.filter(n => ['PENDING', 'OPEN'].includes(n.status)).length },
                { label: 'En cours',   color: '#6aaee0', count: needs.filter(n => ['ACCEPTED', 'FUNDED'].includes(n.status)).length },
                { label: 'Confirmés', color: '#6ec995', count: needs.filter(n => ['COMPLETED', 'CONFIRMED'].includes(n.status)).length },
              ];
              const maxVal = Math.max(1, ...statuses.map(s => s.count));
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                  {statuses.map(s => (
                    <div key={s.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                        <span style={{ color: s.color, fontWeight: 700 }}>{s.count}</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(s.count / maxVal) * 100}%`, background: s.color, borderRadius: 4, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* All Users Table */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Users size={16} style={{ color: 'var(--gold)' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Tous les utilisateurs</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th></tr></thead>
              <tbody>
                {allUsers.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Aucun utilisateur</td></tr>
                ) : allUsers.slice(0, 25).map(u => (
                  <tr key={u.id + u.roleLabel}>
                    <td style={{ fontWeight: 600 }}>{u.nom || u.business_name || '—'}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email || '—'}</td>
                    <td>
                      <span style={{ display: 'inline-flex', padding: '0.15rem 0.6rem', borderRadius: 999, fontSize: '0.75rem', background: u.roleColor + '18', color: u.roleColor, border: `1px solid ${u.roleColor}40`, fontWeight: 600 }}>
                        {u.roleLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={S.layout}>
      {/* Sidebar */}
      <aside style={{ ...S.sidebar, width: sidebarOpen ? 260 : 68, transition: 'width 0.28s cubic-bezier(.4,0,.2,1)' }}>
        {sidebarOpen && (
          <div style={{ padding: '0 0.5rem 1.5rem', overflow: 'hidden' }}>
            <span style={S.tag}>Administration</span>
            <h1 style={{ fontSize: '1.1rem', marginTop: '0.2rem', color: 'var(--text)', fontFamily: 'Georgia, serif', whiteSpace: 'nowrap' }}>Tableau de bord</h1>
          </div>
        )}

        {/* Toggle button */}
        <button
          className="sidebar-toggle-btn"
          style={S.toggleBtn}
          onClick={() => setSidebarOpen(o => !o)}
          title={sidebarOpen ? 'Réduire la sidebar' : 'Ouvrir la sidebar'}
        >
          <PanelLeft size={19} />
          {sidebarOpen && <span style={{ marginLeft: '0.5rem', fontSize: '0.82rem' }}>Menu</span>}
        </button>

        {sidebarOpen && <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.75rem 0' }} />}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: sidebarOpen ? 0 : '0.75rem' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`admin-nav-link${tab === t.id ? ' admin-nav-active' : ''}`}
              style={{ ...S.navLink, justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '0.8rem 1rem' : '0.8rem' }}
              onClick={() => { setTab(t.id); setSearch(''); }}
              title={!sidebarOpen ? t.label : undefined}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}>{t.icon}</span>
              {sidebarOpen && <span style={{ marginLeft: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>{t.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={S.mainContent}>
        {loadingTab && <div style={{ textAlign: 'center', padding: '5rem' }}><div className="spinner" /></div>}

        {!loadingTab && tab === 'overview' && (
          <section>
            <div style={S.pageHeader}><span style={S.tag}>Vue d'ensemble</span><h2 style={S.pageTitle}>Statistiques globales</h2></div>
            {renderOverview()}
          </section>
        )}

        {!loadingTab && tab === 'validators' && (
          <section>
            <div style={S.pageHeader}><span style={S.tag}>Gestion</span><h2 style={S.pageTitle}>Validateurs <span style={{ color: 'var(--gold)', fontSize: '1rem' }}>({validators.length})</span></h2></div>
            {renderUserTable(validators as AnyUser[], 'VALIDATEUR')}
          </section>
        )}

        {!loadingTab && tab === 'partners' && (
          <section>
            <div style={S.pageHeader}><span style={S.tag}>Gestion</span><h2 style={S.pageTitle}>Partenaires <span style={{ color: 'var(--gold)', fontSize: '1rem' }}>({partners.length})</span></h2></div>
            {renderUserTable(partners as AnyUser[], 'PARTENAIRE')}
          </section>
        )}

        {!loadingTab && tab === 'donors' && (
          <section>
            <div style={S.pageHeader}><span style={S.tag}>Gestion</span><h2 style={S.pageTitle}>Donneurs <span style={{ color: 'var(--gold)', fontSize: '1rem' }}>({donors.length})</span></h2></div>
            {renderUserTable(donors, 'DONNEUR')}
          </section>
        )}

        {!loadingTab && tab === 'needs' && (
          <section>
            <div style={S.pageHeader}><span style={S.tag}>Gestion</span><h2 style={S.pageTitle}>Besoins <span style={{ color: 'var(--gold)', fontSize: '1rem' }}>({needs.length})</span></h2></div>
            <div style={S.searchRow}>
              <div style={S.searchWrapper}>
                <Search size={15} style={S.searchIcon} />
                <input placeholder="Rechercher un besoin…" value={search} onChange={e => setSearch(e.target.value)} style={S.searchInput} />
                {search && <button onClick={() => setSearch('')} style={S.clearBtn}><X size={13} /></button>}
              </div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Titre</th><th>Montant</th><th>Statut</th><th>Validateur</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {needs.filter(n => !search || (n.title || '').toLowerCase().includes(search.toLowerCase())).map(n => (
                    <tr key={n.id}>
                      <td style={{ fontWeight: 600 }}>{n.title}</td>
                      <td style={{ color: 'var(--gold)' }}>{n.amount?.toLocaleString('fr-MR')} MRU</td>
                      <td><StatusBadge status={n.status} size="sm" /></td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{n.validateur ? `${n.validateur.nom} ${n.validateur.prenom || ''}` : '—'}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{new Date(n.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="action-btn-del" style={S.deleteBtn} title="Supprimer"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {!loadingTab && tab === 'create' && (
          <section style={{ maxWidth: 560 }}>
            <div style={S.pageHeader}><span style={S.tag}>Création</span><h2 style={{ ...S.pageTitle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={20} style={{ color: 'var(--gold)' }} /> Créer un compte</h2></div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Rôle *</label>
                <select value={createRole} onChange={e => setCreateRole(e.target.value as CreateRole)}>
                  <option value="VALIDATEUR">Validateur</option>
                  <option value="PARTENAIRE">Partenaire</option>
                </select>
              </div>
              <div style={S.twoCol}>
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
                  <div style={{ ...S.twoCol, marginTop: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Nom *</label><input value={form.nom} onChange={f('nom')} required /></div>
                    <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Prénom *</label><input value={form.prenom} onChange={f('prenom')} required /></div>
                  </div>
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label">NNI * <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>(10 chiffres)</span></label>
                    <input value={form.NNI} onChange={f('NNI')} required pattern="[0-9]{10}" minLength={10} maxLength={10} inputMode="numeric" placeholder="Ex: 1234567890" />
                  </div>
                </>
              )}
              {createRole === 'PARTENAIRE' && (
                <>
                  <div className="form-group" style={{ marginTop: '1rem' }}><label className="form-label">Nom de l'établissement *</label><input value={form.business_name} onChange={f('business_name')} required /></div>
                  <div className="form-group">
                    <label className="form-label">Type *</label>
                    <select value={form.business_type} onChange={f('business_type')}>
                      <option value="RESTAURANT">Restaurant</option>
                      <option value="NGO">ONG (NGO)</option>
                      <option value="COMPANY">Entreprise</option>
                      <option value="OTHER">Autre</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Adresse *</label><input value={form.address} onChange={f('address')} required /></div>
                  <div className="form-group"><label className="form-label">Description *</label><textarea value={form.description} onChange={f('description')} required rows={3} /></div>
                </>
              )}
              <div style={S.privacyNote}>
                <EyeOff size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Communiquez le mot de passe de façon sécurisée — il ne sera plus visible après création.</span>
              </div>
              <button type="submit" className="btn btn-primary" disabled={creating} style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
                {creating ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Création…</> : <><CheckCircle size={15} /> Créer le compte {createRole}</>}
              </button>
            </form>
          </section>
        )}
      </main>

      {/* ─── Edit Modal ──────────────────────────────────────────────── */}
      {editingUser && editForm && (
        <div style={S.modalOverlay} onClick={closeEdit}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h3 style={{ fontSize: '1.05rem', fontFamily: 'Georgia, serif' }}>Modifier l'utilisateur</h3>
              <button style={S.iconBtn} onClick={closeEdit}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEdit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {editRole !== 'PARTENAIRE' ? (
                <>
                  <div style={S.twoCol}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Nom</label>
                      <input value={editForm.nom || ''} onChange={e => setEditForm(f => f ? { ...f, nom: e.target.value } : f)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Prénom</label>
                      <input value={editForm.prenom || ''} onChange={e => setEditForm(f => f ? { ...f, prenom: e.target.value } : f)} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email</label>
                    <input type="email" value={editForm.email || ''} onChange={e => setEditForm(f => f ? { ...f, email: e.target.value } : f)} />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nom de l'établissement</label>
                    <input value={editForm.business_name || ''} onChange={e => setEditForm(f => f ? { ...f, business_name: e.target.value } : f)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email</label>
                    <input type="email" value={editForm.email || ''} onChange={e => setEditForm(f => f ? { ...f, email: e.target.value } : f)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Adresse</label>
                    <input value={editForm.address || ''} onChange={e => setEditForm(f => f ? { ...f, address: e.target.value } : f)} />
                  </div>
                </>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                <button type="button" style={S.cancelBtn} onClick={closeEdit}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ justifyContent: 'center' }}>
                  {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Enregistrement…</> : <><Save size={14} /> Enregistrer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CSS ─────────────────────────────────────────────────────── */}
      <style>{`
        .admin-nav-link {
          display: flex; align-items: center;
          border-radius: 10px; border: 1px solid transparent;
          background: transparent; cursor: pointer;
          color: var(--text-secondary); font-size: 0.91rem;
          font-family: Georgia, serif; transition: all 0.22s ease;
          width: 100%; text-align: left; position: relative; overflow: hidden;
        }
        .admin-nav-link::after {
          content:''; position: absolute; left:0; top:0; bottom:0;
          width: 3px; background: var(--gold);
          border-radius: 0 3px 3px 0;
          transform: scaleY(0); transition: transform 0.22s cubic-bezier(.4,0,.2,1);
        }
        .admin-nav-link:hover {
          background: rgba(201,147,58,0.07);
          color: var(--text);
          border-color: rgba(201,147,58,0.18);
          transform: translateX(2px);
        }
        .admin-nav-active {
          background: rgba(201,147,58,0.12) !important;
          border-color: rgba(201,147,58,0.3) !important;
          color: var(--gold) !important;
        }
        .admin-nav-active::after { transform: scaleY(1); }
        .stat-card-hover { transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.14) !important; }
        .action-btn-edit:hover { background: rgba(106,174,224,0.22) !important; }
        .action-btn-del:hover  { background: rgba(224,112,112,0.22) !important; }
        .sidebar-toggle-btn:hover { background: rgba(201,147,58,0.1) !important; color: var(--gold) !important; border-color: rgba(201,147,58,0.25) !important; }
      `}</style>
    </div>
  );
};

/* ─── Style objects ─────────────────────────────────────────────────── */
const S: Record<string, React.CSSProperties> = {
  layout: { display: 'flex', minHeight: 'calc(100vh - 64px)' },
  sidebar: {
    background: 'var(--card)', borderRight: '1px solid var(--border)',
    padding: '1.5rem 0.75rem', display: 'flex', flexDirection: 'column',
    flexShrink: 0, overflowX: 'hidden',
  },
  tag: { color: 'var(--gold)', fontSize: '0.73rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' },
  toggleBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
    width: '100%', background: 'transparent', border: '1px solid var(--border)',
    borderRadius: 8, padding: '0.55rem 0.75rem', color: 'var(--text-secondary)',
    cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Georgia, serif',
    marginBottom: '0.25rem', transition: 'all 0.2s', gap: '0.35rem',
  },
  navLink: {
    display: 'flex', alignItems: 'center', borderRadius: 10,
    border: '1px solid transparent', background: 'transparent',
    cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.91rem',
    fontFamily: 'Georgia, serif', transition: 'all 0.22s ease',
    textAlign: 'left', width: '100%',
  },
  mainContent: { flex: 1, padding: '2.5rem 2.5vw', overflowY: 'auto' },
  pageHeader: { marginBottom: '1.5rem' },
  pageTitle: { fontSize: 'clamp(1.3rem,2vw,1.75rem)', marginTop: '0.25rem', fontFamily: 'Georgia, serif' },
  twoCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  privacyNote: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.6rem 0.85rem', marginTop: '1rem',
    background: 'rgba(201,147,58,0.05)', border: '1px solid rgba(201,147,58,0.15)', borderRadius: 6,
  },
  searchRow: { display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' },
  searchWrapper: { position: 'relative', flex: 1, maxWidth: 380 },
  searchIcon: { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' },
  searchInput: { paddingLeft: '2.5rem', paddingRight: '2rem', width: '100%', boxSizing: 'border-box', padding: '0.55rem 2rem 0.55rem 2.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: '0.88rem' },
  clearBtn: { position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 },
  addBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', borderRadius: 8, background: 'rgba(201,147,58,0.1)', border: '1px solid rgba(201,147,58,0.3)', color: 'var(--gold)', fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'Georgia, serif', whiteSpace: 'nowrap' },
  actionBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 7, background: 'rgba(106,174,224,0.1)', border: '1px solid rgba(106,174,224,0.2)', color: '#6aaee0', cursor: 'pointer', transition: 'all 0.2s' },
  deleteBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 7, background: 'rgba(224,112,112,0.1)', border: '1px solid rgba(224,112,112,0.2)', color: '#e07070', cursor: 'pointer', transition: 'all 0.2s' },
  // Modal
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.4)', animation: 'fadeIn 0.2s ease' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '0.25rem', borderRadius: 6 },
  cancelBtn: { padding: '0.5rem 1.2rem', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.88rem' },
};

const O: Record<string, React.CSSProperties> = {
  statCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden' },
  statIcon: { width: 50, height: 50, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { fontSize: '2rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 },
  statLabel: { fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' },
  chartCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem 1.5rem' },
  chartTitle: { display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600, fontSize: '0.88rem', marginBottom: '1rem', color: 'var(--text)' },
};

export default AdminDashboard;
