import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, HandHeart, Moon, EyeOff, ClipboardList, CreditCard,
  Camera, User, Store, Banknote, CheckCircle, Users, Search, Handshake, ArrowRight, ArrowDown
} from 'lucide-react';
import { getPublicNeeds } from '../service/needs.service';
import type { Need } from '../types';
import NeedCard from '../components/NeedCard';

// ─── Stats live from API ──────────────────────────────────────────────────────
interface Stats {
  totalRaised: number;
  confirmedNeeds: number;
  activeValidators: number;
}

const LandingPage: React.FC = () => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [stats] = useState<Stats>({ totalRaised: 0, confirmedNeeds: 0, activeValidators: 0 });
  const howRef = useRef<HTMLElement>(null);

  useEffect(() => {
    getPublicNeeds(1, 3).then(r => setNeeds(r.data)).catch(() => {});
    // /public/stats does not exist in the backend - stats default to 0
  }, []);

  const scrollToHow = (e: React.MouseEvent) => {
    e.preventDefault();
    howRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section style={styles.hero}>
        <div style={styles.heroBg} />
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={styles.badge}>✦ Plateforme de charité numérique · Mauritanie · Ramadan</div>
          <h1 style={styles.heroTitle}>
            Faire le bien avec<br />
            <span style={styles.heroGold}>excellence</span>
          </h1>
          <p className="arabic" style={{ ...styles.heroArabic, textAlign: 'center', width: '100%' }}>
            إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ
          </p>
          <p style={styles.heroSub}>
            IHSAN rend chaque don traçable de A à Z.<br />
            Pas de collecte publique. Le bénéficiaire garde sa dignité. Vous voyez l'impact.
          </p>
          <div style={styles.heroCtas}>
            <Link to="/catalog" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={18} /> Voir les besoins
            </Link>
            <a href="#how" className="btn btn-outline btn-lg" onClick={scrollToHow} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <ArrowDown size={18} /> Comment ça marche
            </a>
          </div>

          {/* Slogan */}
          <div style={styles.slogan}>
            "Ihsan : faire le bien avec excellence, comme si tu voyais ce que tu accomplis."
          </div>
        </div>

        {/* Animated dots */}
        <div style={styles.dots}>
          {[...Array(6)].map((_, i) => (
            <span key={i} style={{ ...styles.dot, animationDelay: `${i * 0.4}s` }} />
          ))}
        </div>
      </section>

      {/* ─── Problem ─────────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--card)' }}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>Le problème</span>
            <h2>Des réalités qui peinent à se connecter</h2>
          </div>
          <div className="grid-3" style={{ marginTop: '2.5rem' }}>
            <div style={styles.problemCard}>
              <div style={styles.problemIcon}><HandHeart size={36} color="var(--gold)" /></div>
              <h3 style={{ color: 'var(--gold)', marginBottom: '0.75rem' }}>Le donneur qui doute</h3>
              <p style={styles.problemText}>
                Vous souhaitez aider, mais vous ne savez pas si votre don arrive à destination.
                Aucune preuve. Aucune traçabilité. Juste une promesse floue dans un contexte difficile.
              </p>
            </div>
            <div style={styles.problemCard}>
              <div style={styles.problemIcon}><Moon size={36} color="var(--gold)" /></div>
              <h3 style={{ color: 'var(--gold)', marginBottom: '0.75rem' }}>Le bénéficiaire silencieux</h3>
              <p style={styles.problemText}>
                Par dignité ou par culture, il ne demandera jamais publiquement.
                Son besoin reste invisible. Pourtant, il est réel, urgent, et bien connu des gens du quartier.
              </p>
            </div>
            <div style={styles.problemCard}>
              <div style={styles.problemIcon}><EyeOff size={36} color="var(--gold)" /></div>
              <h3 style={{ color: 'var(--gold)', marginBottom: '0.75rem' }}>L'absence de confiance</h3>
              <p style={styles.problemText}>
                L'anonymat est sacré, mais l'absence de preuves freine les bonnes volontés.
                Comment garantir qu'un don est arrivé sans exposer le bénéficiaire publiquement ?
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(201,147,58,0.06)', border: '1px solid rgba(201,147,58,0.15)', borderRadius: 12 }}>
            <p style={{ color: 'var(--text)', fontSize: '1.05rem', fontStyle: 'italic' }}>
              IHSAN fait le lien. Un Validateur terrain identifie, publie et confirme chaque besoin
              avec une preuve photographique anonymisée et documentée.
            </p>
          </div>
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────────────────────── */}
      <section className="section" id="how" ref={howRef as React.RefObject<HTMLElement>}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>Le processus</span>
            <h2>Comment ça marche</h2>
          </div>
          <div className="grid-3" style={{ marginTop: '2.5rem' }}>
            {[
              {
                step: '01', icon: <ClipboardList size={36} color="var(--text)" />,
                title: 'Le Validateur identifie',
                desc: 'Un bénévole terrain rencontre la famille dans le besoin, évalue la situation et publie un besoin précis et anonymisé.',
              },
              {
                step: '02', icon: <CreditCard size={36} color="var(--text)" />,
                title: 'Le Donneur finance',
                desc: 'Vous parcourez le catalogue, choisissez un besoin (repas, fournitures) et financez exactement ce montant.',
              },
              {
                step: '03', icon: <Camera size={36} color="var(--text)" />,
                title: 'La preuve vous parvient',
                desc: 'Après la remise, le Validateur upload une photo anonymisée. Vous recevez un reçu avec un hash cryptographique immuable.',
              },
            ].map((step, i) => (
              <div key={i} style={styles.stepCard}>
                <div style={styles.stepNum}>{step.step}</div>
                <div style={{ marginBottom: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                  {step.icon}
                </div>
                <h3 style={{ marginBottom: '0.75rem', fontSize: '1.05rem' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{step.desc}</p>
                {i < 2 && <div style={styles.stepArrow}><ArrowRight size={24} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4 Actors ─────────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--card)' }} id="actors">
        <div className="container">
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>L'écosystème</span>
            <h2>Les 4 acteurs d'IHSAN</h2>
          </div>
          <div className="grid-2" style={{ marginTop: '2.5rem' }}>
            {[
              { icon: <Heart size={38} color="#6aaee0" />, role: 'Donneur', color: '#6aaee0', desc: 'Choisit et finance un besoin précis. Reçoit un reçu SHA-256 vérifiable. Voit l\'impact de son don sans compromettre la dignité.' },
              { icon: <Moon size={38} color="#6ec995" />, role: 'Bénéficiaire', color: '#6ec995', desc: 'Reçoit l\'aide dignement, sans jamais apparaître publiquement. Son identité est rigoureusement protégée à toutes les étapes.' },
              { icon: <User size={38} color="var(--gold)" />, role: 'Validateur', color: 'var(--gold)', desc: 'Bénévole terrain accrédité qui identifie les besoins, les certifie et confirme chaque remise du don par une preuve photographique.' },
              { icon: <Store size={38} color="#E8B660" />, role: 'Partenaire', color: '#E8B660', desc: 'Commerce (restaurant, pharmacie, boutique) qui prépare et remet les biens. Ancré dans le quartier, c\'est un maillon de confiance direct.' },
            ].map((actor, i) => (
              <div key={i} style={{ ...styles.actorCard, borderColor: actor.color + '30' }}>
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                  {actor.icon}
                </div>
                <h3 style={{ color: actor.color, marginBottom: '0.5rem' }}>{actor.role}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{actor.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Live Stats ───────────────────────────────────────────────────── */}
      <section className="section" id="stats">
        <div className="container">
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>Impact en temps réel</span>
            <h2>Chiffres live</h2>
          </div>
          <div style={styles.statsGrid}>
            {[
              { value: stats.totalRaised.toLocaleString('fr-MR') + ' MRU', label: 'Collectés au total', icon: <Banknote size={32} color="var(--gold)" /> },
              { value: stats.confirmedNeeds.toString(), label: 'Besoins confirmés', icon: <CheckCircle size={32} color="var(--gold)" /> },
              { value: stats.activeValidators.toString(), label: 'Validateurs actifs', icon: <Users size={32} color="var(--gold)" /> },
            ].map((s, i) => (
              <div key={i} style={styles.statCard}>
                <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <div style={styles.statValue}>{s.value || '—'}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Recent Needs Preview ─────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--card)', paddingTop: '3rem' }}>
        <div className="container">
          <div style={{ ...styles.sectionHeader, ...{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' } }}>
            <div>
              <span style={styles.sectionTag}>Catalogue</span>
              <h2 style={{ textAlign: 'left' }}>Besoins récents</h2>
            </div>
            <Link to="/catalog" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              Voir tous <ArrowRight size={14} />
            </Link>
          </div>
          {needs.length > 0 ? (
            <div className="grid-3" style={{ marginTop: '2rem' }}>
              {needs.map(need => <NeedCard key={need.id} need={need} />)}
            </div>
          ) : (
             <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
               <div className="spinner" style={{ margin: '0 auto 1rem' }} />
               <p>Chargement des besoins…</p>
             </div>
          )}
        </div>
      </section>

      {/* ─── Transparency ─────────────────────────────────────────────────── */}
      <section className="section" id="transparency">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <span style={styles.sectionTag}>Transparence totale</span>
              <h2 style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Un hash pour chaque don</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '1rem' }}>
                Chaque transaction est identifiée par un hash SHA-256 généré directement
                dans votre navigateur avec l'API Web Crypto native — aucune librairie externe.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '0.75rem' }}>
                Ce hash est immuable et vérifiable par n'importe qui sur le tableau de bord public.
                Votre reçu numérique en est la preuve permanente.
              </p>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/dashboard" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Search size={14} /> Vérifier un hash
                </Link>
                <Link to="/catalog" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ClipboardList size={14} /> Voir le catalogue
                </Link>
              </div>
            </div>
            <div style={styles.hashDemo}>
              <div style={styles.hashTitle}>Exemple de reçu IHSAN</div>
              <div style={styles.hashLine}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>ID don</span>
                <code style={styles.hashCode}>#IHSAN-2025-0042</code>
              </div>
              <div style={styles.hashLine}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Montant</span>
                <code style={styles.hashCode}>1 250 MRU</code>
              </div>
              <div style={styles.hashLine}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>SHA-256</span>
                <code style={{ ...styles.hashCode, fontSize: '0.72rem', wordBreak: 'break-all' }}>
                  a3f5d2e98c71b04f…
                </code>
              </div>
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(45,122,79,0.12)', borderRadius: 8, border: '1px solid rgba(110,201,149,0.25)', textAlign: 'center' }}>
                <span style={{ color: '#6ec995', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <CheckCircle size={14} /> Hash vérifié — Transaction immuable
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'linear-gradient(135deg, #16191F, #0F1117)', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <p className="arabic" style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#fff', textAlign: 'center', width: '100%' }}>
            وَأَحْسِنُوا ۛ إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ
          </p>
          <h2 style={{ marginBottom: '1rem', color: '#fff' }}>Prêt à faire une différence&nbsp;?</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', maxWidth: 520, margin: '0 auto 2rem' }}>
            Chaque ouguiya compte. Chaque iftar offert est une lumière dans une nuit de Ramadan.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/catalog" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={18} /> Faire un don maintenant
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              <Handshake size={18} /> Je suis bénévole
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes heroFade { from { opacity: 0; transform: translateY(20px); } }
        @keyframes dotPulse { 0%,100%{opacity:0.15;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.6)} }
        .step-card:hover { border-color: var(--gold-muted) !important; }
        .actor-card:hover { transform: translateY(-2px); }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  hero: {
    position: 'relative', overflow: 'hidden',
    padding: '7rem 1.5rem 6rem',
    background: 'radial-gradient(ellipse at 50% 0%, rgba(201,147,58,0.12) 0%, transparent 65%), var(--bg)',
  },
  heroBg: {
    position: 'absolute', inset: 0,
    backgroundImage: 'radial-gradient(1px 1px at 20% 30%, rgba(201,147,58,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 80% 70%, rgba(201,147,58,0.2) 0%, transparent 100%)',
    pointerEvents: 'none',
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(201,147,58,0.1)', border: '1px solid rgba(201,147,58,0.25)',
    color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '0.06em',
    padding: '0.35rem 1rem', borderRadius: 999, marginBottom: '1.5rem',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 'clamp(2.5rem,6vw,4.5rem)', fontWeight: 700,
    lineHeight: 1.15, marginBottom: '1rem', color: 'var(--text)',
    animation: 'heroFade 0.8s ease-out',
  },
  heroGold: { color: 'var(--gold)' },
  heroArabic: {
    fontSize: '1.3rem', marginBottom: '1.5rem',
    animation: 'heroFade 0.8s 0.1s ease-out both',
  },
  heroSub: {
    fontSize: 'clamp(1rem,2vw,1.15rem)', color: 'var(--text-secondary)',
    lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 560, margin: '0 auto 2.5rem',
    animation: 'heroFade 0.8s 0.2s ease-out both',
  },
  heroCtas: {
    display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap',
    animation: 'heroFade 0.8s 0.3s ease-out both',
    marginBottom: '2rem',
  },
  slogan: {
    display: 'inline-block',
    color: 'var(--text-secondary)', fontSize: '0.88rem', fontStyle: 'italic',
    margin: '0.5rem auto 0', maxWidth: 500,
  },
  dots: {
    position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
    display: 'flex', gap: '0.5rem',
  },
  dot: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'var(--gold)', opacity: 0.2,
    animation: 'dotPulse 2s infinite',
  },
  sectionHeader: { marginBottom: '1rem', textAlign: 'center' },
  sectionTag: {
    color: 'var(--gold)', fontSize: '0.78rem', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.5rem',
  },
  problemCard: {
    background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '2rem', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center'
  },
  problemIcon: {
    background: 'rgba(201,147,58,0.1)', borderRadius: '50%',
    width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '1.25rem', border: '1px solid rgba(201,147,58,0.2)'
  },
  problemText: { color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem' },
  stepCard: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '2rem', position: 'relative', textAlign: 'center',
    transition: 'border-color 0.2s',
  },
  stepNum: {
    position: 'absolute', top: 16, left: 16,
    color: 'rgba(201,147,58,0.3)', fontSize: '2rem', fontWeight: 700, lineHeight: 1,
  },
  stepArrow: {
    position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
    color: 'var(--gold)', zIndex: 1, opacity: 0.6
  },
  actorCard: {
    background: 'var(--bg)', border: '1px solid transparent',
    borderRadius: 12, padding: '2rem', textAlign: 'center',
    transition: 'transform 0.2s, border-color 0.2s',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem', marginTop: '2.5rem',
  },
  statCard: {
    background: 'var(--card)', border: '1px solid rgba(201,147,58,0.15)',
    borderRadius: 12, padding: '2rem', textAlign: 'center',
    boxShadow: '0 0 24px rgba(201,147,58,0.05)',
  },
  statValue: {
    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700,
    color: 'var(--gold)', lineHeight: 1.1, marginBottom: '0.35rem',
  },
  statLabel: { color: 'var(--text-secondary)', fontSize: '0.88rem' },
  hashDemo: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '1.5rem',
  },
  hashTitle: {
    color: 'var(--gold)', fontSize: '0.82rem', textTransform: 'uppercase',
    letterSpacing: '0.08em', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem',
  },
  hashLine: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    gap: '1rem', marginBottom: '0.75rem',
  },
  hashCode: {
    fontFamily: '"Courier New", monospace', fontSize: '0.82rem',
    color: 'var(--text)', background: 'rgba(201,147,58,0.06)',
    padding: '0.15rem 0.4rem', borderRadius: 4, textAlign: 'right', flex: 1,
  },
};

export default LandingPage;
