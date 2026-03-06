import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Loader2, Heart, User, Building2, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../service/auth.service';
import type { Role } from '../../types';

const LoginPage: React.FC = () => {
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(email, password);
      if (!userData.token) throw new Error('Token manquant dans la réponse');
      loginSuccess({
        token: userData.token,
        email: userData.email || email,
        role: userData.role as Role,
        nom: userData.nom,
        prenom: userData.prenom,
        business_name: userData.business_name,
        description: userData.description,
        address: userData.address,
      });
      const path =
        userData.role === 'VALIDATEUR' ? '/validator' :
        userData.role === 'PARTENAIRE' ? '/partner' :
        userData.role === 'ADMIN'      ? '/admin' :
        '/catalog';
      navigate(path, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Email ou mot de passe incorrect.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const ROLES = [
    { label: 'Donneur', icon: <Heart size={13} /> },
    { label: 'Validateur', icon: <User size={13} /> },
    { label: 'Partenaire', icon: <Building2 size={13} /> },
    { label: 'Admin', icon: <Settings size={13} /> },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={styles.logo}>✦ IHSAN</div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Connexion</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Connectez-vous à votre espace IHSAN
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Adresse email</label>
            <div style={styles.inputWrapper}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoComplete="email"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div style={styles.inputWrapper}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                style={styles.eyeBtn}
                onClick={() => setShowPw(v => !v)}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
          >
            {loading
              ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Connexion…</>
              : <><LogIn size={15} /> Se connecter</>
            }
          </button>
        </form>

        <div style={styles.divider}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', padding: '0 0.75rem' }}>ou</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: 'var(--gold)' }}>Créer un compte donneur</Link>
          </p>
        </div>

        {/* Role info */}
        <div style={styles.roleInfo}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Accès selon votre rôle
          </div>
          <div style={styles.roles}>
            {ROLES.map(r => (
              <div key={r.label} style={styles.roleTag}>
                {r.icon} {r.label}
              </div>
            ))}
          </div>
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
    background: 'radial-gradient(ellipse at 50% 0%, rgba(201,147,58,0.06) 0%, transparent 60%)',
  },
  card: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 16, padding: '2.5rem',
    width: '100%', maxWidth: 440,
    boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
  },
  logo: {
    color: 'var(--gold)', fontFamily: 'Georgia, serif',
    fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem',
  },
  inputWrapper: { position: 'relative' },
  inputIcon: {
    position: 'absolute', left: '0.85rem', top: '50%',
    transform: 'translateY(-50%)', color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  eyeBtn: {
    position: 'absolute', right: '0.75rem', top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', padding: '0.2rem',
    display: 'flex', alignItems: 'center',
  },
  divider: { display: 'flex', alignItems: 'center', margin: '1.5rem 0' },
  roleInfo: {
    marginTop: '1.5rem', padding: '1rem',
    background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)',
  },
  roles: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' },
  roleTag: {
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    padding: '0.2rem 0.6rem', borderRadius: 999,
    background: 'rgba(201,147,58,0.08)', color: 'var(--gold)',
    fontSize: '0.78rem', border: '1px solid rgba(201,147,58,0.2)',
  },
};

export default LoginPage;
