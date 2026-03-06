import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer style={styles.footer}>
      <div className="container">
        <div style={styles.grid}>
          {/* Brand */}
          <div style={styles.brand}>
            <div style={styles.logo}>
              <span style={styles.logoIcon}>✦</span>
              <span>IHSAN</span>
            </div>
            <p style={styles.tagline}>
              Faire le bien avec excellence,<br />comme si tu voyais ce que tu accomplis.
            </p>
            <p className="arabic" style={{ fontSize: '1.05rem', marginTop: '0.75rem' }}>
              إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ
            </p>
          </div>

          {/* Navigation */}
          <div style={styles.col}>
            <h4 style={styles.colTitle}>Navigation</h4>
            <div style={styles.links}>
              <Link to="/" style={styles.link}>Accueil</Link>
              <Link to="/catalog" style={styles.link}>Catalogue des besoins</Link>
              <Link to="/dashboard" style={styles.link}>Tableau de bord</Link>
              <Link to="/login" style={styles.link}>Se connecter</Link>
              <Link to="/register" style={styles.link}>Créer un compte</Link>
            </div>
          </div>

          {/* Info */}
          <div style={styles.col}>
            <h4 style={styles.colTitle}>À propos</h4>
            <div style={styles.links}>
              <a href="/#how" style={styles.link}>Comment ça marche</a>
              <a href="/#actors" style={styles.link}>Les 4 acteurs</a>
              <a href="/#transparency" style={styles.link}>Transparence SHA-256</a>
              <a href="/#stats" style={styles.link}>Statistiques live</a>
            </div>
          </div>
        </div>

        <hr className="gold-line" />

        <div style={styles.bottom}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} IHSAN — Plateforme de charité numérique · Mauritanie
          </p>
          <p className="arabic" style={{ fontSize: '0.9rem' }}>
            وَمَا تُنفِقُوا مِنْ خَيْرٍ فَلِأَنفُسِكُمْ ۚ وَمَا تُنفِقُونَ إِلَّا ابْتِغَاءَ وَجْهِ اللَّهِ
          </p>
        </div>
      </div>
    </footer>
  );
};

const styles: Record<string, React.CSSProperties> = {
  footer: {
    borderTop: '1px solid var(--border)',
    background: 'var(--card)',
    padding: '4rem 1.5rem 2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '2.5rem',
  },
  brand: {},
  logo: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    color: 'var(--gold)', fontFamily: 'Georgia, serif',
    fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem',
  },
  logoIcon: { fontSize: '1rem', color: 'var(--gold-light)' },
  tagline: { color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, fontStyle: 'italic' },
  col: {},
  colTitle: {
    color: 'var(--gold)', fontSize: '0.82rem',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    marginBottom: '1rem',
  },
  links: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  link: { color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' },
  bottom: {
    display: 'flex', flexWrap: 'wrap',
    justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
  },
};

export default Footer;
