import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Info, Loader2, CheckCircle, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { register, login } from '../../service/auth.service';

const RegisterPage: React.FC = () => {
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', nom: '', prenom: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.email, form.password, form.nom, form.prenom);
      const userData = await login(form.email, form.password);
      if (!userData.token) throw new Error('Token manquant après connexion');
      loginSuccess({
        token: userData.token,
        email: userData.email || form.email,
        role: 'DONNEUR',
        nom: userData.nom || form.nom,
        prenom: userData.prenom || form.prenom,
      });
      navigate('/catalog', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'inscription. Vérifiez vos informations.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={styles.logo}>✦ IHSAN</div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Créer un compte</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Rejoignez la communauté des donneurs IHSAN
          </p>
        </div>

        {/* Notice */}
        <div style={styles.notice}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <Info size={15} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <div style={{ fontSize: '0.82rem', color: 'var(--gold)', marginBottom: '0.2rem', fontWeight: 600 }}>
                Inscription réservée aux donneurs
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Les comptes Validateur, Partenaire et Admin sont créés uniquement par l'administrateur.
              </p>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Name grid — responsive */}
          <div style={styles.nameGrid}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nom</label>
              <div style={styles.inputWrapper}>
                <User size={15} style={styles.inputIcon} />
                <input
                  name="nom" value={form.nom} onChange={handleChange}
                  placeholder="Diallo" required style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Prénom</label>
              <input name="prenom" value={form.prenom} onChange={handleChange} placeholder="Ali" required />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Adresse email</label>
            <div style={styles.inputWrapper}>
              <Mail size={15} style={styles.inputIcon} />
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="votre@email.com" required
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div style={styles.inputWrapper}>
              <Lock size={15} style={styles.inputIcon} />
              <input
                type={showPw ? 'text' : 'password'} name="password" value={form.password}
                onChange={handleChange} placeholder="Minimum 8 caractères" required minLength={8}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                style={styles.eyeBtn}
                onClick={() => setShowPw(v => !v)}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit" className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
          >
            {loading
              ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Création du compte…</>
              : <><CheckCircle size={15} /> Créer mon compte donneur</>
            }
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: 'var(--gold)' }}>Se connecter</Link>
          </p>
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
    width: '100%', maxWidth: 480,
    boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
  },
  logo: { color: 'var(--gold)', fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' },
  notice: {
    background: 'rgba(201,147,58,0.06)', border: '1px solid rgba(201,147,58,0.2)',
    borderRadius: 8, padding: '0.85rem 1rem', marginBottom: '1.25rem',
  },
  nameGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
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
};

export default RegisterPage;
