import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell, LogIn, LogOut, LayoutDashboard, Heart, Menu, X,
  Sun, Moon, ChevronDown, Home, LayoutGrid,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getNotifications, markAsRead } from '../../service/notifications.service';
import type { Notification } from '../../types';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, getDashboardPath } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    if (isAuthenticated) {
      getNotifications().then(setNotifications).catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
    setMobileOpen(false);
  };

  const unread = notifications.filter(n => !n.isRead).length;
  const displayName = user?.nom
    ? `${user.nom}${user.prenom ? ' ' + user.prenom : ''}`
    : user?.business_name || user?.email || '';

  const isActive = (path: string) => location.pathname === path;

  const roleLinks: { to: string; label: string }[] = [];
  // Nav links are hidden for roles that have their own sidebar navigation
  const hiddenRoles = ['ADMIN', 'PARTENAIRE'];
  const showNavLinks = !user || !hiddenRoles.includes(user.role || '');

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/catalog', label: 'Catalogue' },
    { to: '/dashboard', label: 'Tableau de bord' },
    ...(user?.role === 'VALIDATEUR' ? [{ to: '/validator', label: 'Mes missions' }] : []),
  ];

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.inner}>
          {/* Logo */}
          <Link to="/" style={styles.logo}>
            <span style={styles.logoStar}>✦</span>
            <span>IHSAN</span>
          </Link>

          {/* Desktop links — hidden for Admin / Partenaire */}
          <div style={styles.desktopLinks} className="navbar-desktop-links">
            {showNavLinks && navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                style={({ isActive }) => ({
                  ...styles.link,
                  ...(isActive ? styles.linkActive : {}),
                })}
              >
                {label}
                {isActive(to) && <span style={styles.activeLine} />}
              </NavLink>
            ))}
          </div>

          {/* Right actions */}
          <div style={styles.right}>
            {/* Theme toggle */}
            <button style={styles.iconBtn} className="navbar-icon-btn" onClick={toggleTheme} title="Changer le thème" aria-label="Thème">
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {!isAuthenticated ? (
              <Link to="/login" style={styles.loginBtn} className="navbar-login navbar-login-btn">
                <LogIn size={15} />
                Se connecter
              </Link>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="navbar-right-auth">
                {/* Bell */}
                <div style={{ position: 'relative' }} ref={notifRef}>
                  <button style={styles.iconBtn} className="navbar-icon-btn" onClick={() => setNotifOpen(o => !o)} aria-label="Notifications">
                    <Bell size={17} />
                    {unread > 0 && <span style={styles.badge}>{unread}</span>}
                  </button>
                  {notifOpen && (
                    <div style={styles.dropdown}>
                      <div style={styles.dropdownHeader}>Notifications</div>
                      {notifications.length === 0 ? (
                        <div style={styles.dropdownEmpty}>Aucune notification</div>
                      ) : (
                        notifications.slice(0, 8).map(n => (
                          <div key={n.id}
                            className="navbar-notif-item"
                            style={{ ...styles.notifItem, opacity: n.isRead ? 0.5 : 1 }}
                            onClick={() => {
                              markAsRead(n.id).then(() =>
                                setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x))
                              );
                            }}
                          >
                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{n.title}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{n.body}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Avatar */}
                <div style={{ position: 'relative' }} ref={userMenuRef}>
                  <button style={styles.avatar} className="navbar-avatar" onClick={() => setUserMenuOpen(o => !o)}>
                    <span style={styles.avatarInitial}>{displayName.charAt(0).toUpperCase()}</span>
                    <span style={styles.avatarName}>{displayName}</span>
                    <ChevronDown size={13} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                  </button>
                  {userMenuOpen && (
                    <div style={{ ...styles.dropdown, right: 0, left: 'auto', minWidth: '200px' }}>
                      <Link to={getDashboardPath()} style={styles.dropdownItem} className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        <LayoutDashboard size={14} /> Mon espace
                      </Link>
                      {user?.role === 'DONNEUR' && (
                        <Link to="/my-donations" style={styles.dropdownItem} className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                          <Heart size={14} /> Mes dons
                        </Link>
                      )}
                      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.25rem 0' }} />
                      <button style={{ ...styles.dropdownItem, color: '#e07070', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }} className="navbar-dropdown-item" onClick={handleLogout}>
                        <LogOut size={14} /> Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile hamburger */}
            <button style={styles.hamburger} className="navbar-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu mobile">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div style={styles.overlay} onClick={() => setMobileOpen(false)}>
          <div style={styles.drawer} onClick={e => e.stopPropagation()}>
            <div style={styles.drawerHeader}>
              <span style={styles.logo}>
                <span style={styles.logoStar}>✦</span> IHSAN
              </span>
              <button style={styles.iconBtn} onClick={() => setMobileOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.drawerLinks}>
              {navLinks.map(({ to, label, icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="navbar-drawer-link"
                  style={{ ...styles.drawerLink, ...(isActive(to) ? styles.drawerLinkActive : {}) }}
                  onClick={() => setMobileOpen(false)}
                >
                  {icon} {label}
                </Link>
              ))}
              {roleLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="navbar-drawer-link"
                  style={{ ...styles.drawerLink, ...(isActive(to) ? styles.drawerLinkActive : {}) }}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              ))}

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />

              {/* Theme + Auth in drawer */}
              <button style={styles.drawerLink} className="navbar-drawer-link" onClick={() => { toggleTheme(); setMobileOpen(false); }}>
                {theme === 'dark' ? <><Sun size={15} /> Mode clair</> : <><Moon size={15} /> Mode sombre</>}
              </button>

              {!isAuthenticated ? (
                <Link to="/login" onClick={() => setMobileOpen(false)} style={{ ...styles.drawerLink, color: 'var(--gold)' }} className="navbar-drawer-link">
                  <LogIn size={15} /> Se connecter
                </Link>
              ) : (
                <>
                  <Link to={getDashboardPath()} style={styles.drawerLink} className="navbar-drawer-link" onClick={() => setMobileOpen(false)}>
                    <LayoutDashboard size={15} /> Mon espace
                  </Link>
                  {user?.role === 'DONNEUR' && (
                    <Link to="/my-donations" style={styles.drawerLink} className="navbar-drawer-link" onClick={() => setMobileOpen(false)}>
                      <Heart size={15} /> Mes dons
                    </Link>
                  )}
                  <button style={{ ...styles.drawerLink, color: '#e07070', background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }} className="navbar-drawer-link" onClick={handleLogout}>
                    <LogOut size={15} /> Se déconnecter
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
    background: 'var(--navbar-bg)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)',
    transition: 'background 0.3s',
  },
  inner: {
    maxWidth: 1280, margin: '0 auto',
    display: 'flex', alignItems: 'center',
    padding: '0 1rem', height: 64, gap: '2rem',
    position: 'relative',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '0.45rem',
    color: 'var(--gold)', fontFamily: 'Georgia, serif',
    fontSize: '1.25rem', fontWeight: 700, textDecoration: 'none',
    letterSpacing: '0.04em', flexShrink: 0,
  },
  logoStar: { fontSize: '0.9rem', color: 'var(--gold-light)' },
  desktopLinks: {
    display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1,
  },
  link: {
    position: 'relative',
    padding: '0.5rem 0.85rem', borderRadius: 6,
    color: 'var(--text-secondary)', fontSize: '0.88rem',
    transition: 'color 0.2s', textDecoration: 'none',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  linkActive: { color: 'var(--gold)' },
  activeLine: {
    position: 'absolute', bottom: -2, left: '50%',
    transform: 'translateX(-50%)',
    width: '80%', height: 2,
    background: 'var(--gold)', borderRadius: 1,
  },
  right: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 },
  iconBtn: {
    position: 'relative', background: 'transparent', border: 'none',
    color: 'var(--text-secondary)', cursor: 'pointer',
    padding: '0.45rem', borderRadius: '50%', transition: 'color 0.2s, background 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: -2, right: -2,
    background: 'var(--gold)', color: '#0F1117',
    borderRadius: 999, fontSize: '0.58rem', fontWeight: 700,
    padding: '1px 4px', minWidth: 14, textAlign: 'center',
    lineHeight: 1.4,
  },
  loginBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    border: '1.5px solid var(--gold)', color: 'var(--gold)',
    padding: '0.4rem 1rem', borderRadius: 8, fontSize: '0.88rem',
    fontFamily: 'Georgia, serif', fontWeight: 600,
    transition: 'background 0.2s, color 0.2s',
    textDecoration: 'none',
  },
  avatar: {
    display: 'flex', alignItems: 'center', gap: '0.45rem',
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '0.3rem 0.7rem',
    cursor: 'pointer', transition: 'border-color 0.2s',
    color: 'var(--text)',
  },
  avatarInitial: {
    width: 26, height: 26, borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
    color: '#0F1117', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
  },
  avatarName: { fontSize: '0.85rem', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', left: 0,
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 10, minWidth: 260, zIndex: 999,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    overflow: 'hidden',
  },
  dropdownHeader: {
    padding: '0.65rem 1rem', fontSize: '0.78rem',
    color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em',
    borderBottom: '1px solid var(--border)',
  },
  dropdownEmpty: { padding: '1rem', fontSize: '0.88rem', color: 'var(--text-secondary)', textAlign: 'center' },
  notifItem: {
    padding: '0.7rem 1rem', borderBottom: '1px solid var(--border)',
    cursor: 'pointer', transition: 'background 0.15s',
  },
  dropdownItem: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.6rem 1rem', color: 'var(--text)', fontSize: '0.88rem',
    transition: 'background 0.15s', textDecoration: 'none',
  },
  hamburger: {
    display: 'none', background: 'none', border: 'none',
    cursor: 'pointer', padding: '0.4rem',
    color: 'var(--text)',
  },
  // Mobile overlay
  overlay: {
    position: 'fixed', inset: 0, zIndex: 49,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(2px)',
  },
  drawer: {
    position: 'fixed', top: 0, right: 0, bottom: 0,
    width: 'min(320px, 90vw)',
    background: 'var(--card)',
    borderLeft: '1px solid var(--border)',
    zIndex: 50,
    display: 'flex', flexDirection: 'column',
    animation: 'drawerIn 0.25s cubic-bezier(0.4,0,0.2,1)',
    boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
    overflowY: 'auto',
  },
  drawerHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid var(--border)',
  },
  drawerLinks: { padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' },
  drawerLink: {
    display: 'flex', alignItems: 'center', gap: '0.65rem',
    padding: '0.75rem 1rem', borderRadius: 8,
    color: 'var(--text-secondary)', fontSize: '0.95rem',
    textDecoration: 'none', transition: 'background 0.15s, color 0.15s',
    fontFamily: 'Georgia, serif',
  },
  drawerLinkActive: { color: 'var(--gold)', background: 'rgba(201,147,58,0.08)' },
};

// Apply responsive display via CSS in global stylesheet
const style = document.createElement('style');
style.textContent = `
  @media (max-width: 768px) {
    .navbar-desktop-links { display: none !important; }
    .navbar-hamburger { display: flex !important; }
    .navbar-login { display: none !important; }
    .navbar-right-auth { display: none !important; }
  }
  @media (min-width: 769px) {
    .navbar-hamburger { display: none !important; }
    .navbar-mobile-login { display: none !important; }
  }
  .navbar-login-btn:hover { background: var(--gold) !important; color: #0F1117 !important; }
  .navbar-icon-btn:hover { background: var(--card-hover) !important; color: var(--text) !important; }
  .navbar-dropdown-item:hover { background: var(--card-hover) !important; }
  .navbar-notif-item:hover { background: var(--card-hover) !important; }
  .navbar-avatar:hover { border-color: var(--gold) !important; }
  .navbar-drawer-link:hover { background: var(--card-hover) !important; color: var(--text) !important; }
`;
if (typeof document !== 'undefined') document.head.appendChild(style);

export default Navbar;
