import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface HashDisplayProps {
  hash: string;
  maxLength?: number;
}

const HashDisplay: React.FC<HashDisplayProps> = ({ hash, maxLength = 20 }) => {
  const [copied, setCopied] = useState(false);

  const truncated = hash.length > maxLength
    ? `${hash.slice(0, maxLength)}…`
    : hash;

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
    <div style={styles.wrapper} title={hash}>
      <code style={styles.code}>{truncated}</code>
      <button
        style={{ ...styles.btn, ...(copied ? styles.btnCopied : {}) }}
        onClick={handleCopy}
        title="Copier le hash complet"
      >
        {copied
          ? <><Check size={11} /> Copié</>
          : <><Copy size={11} /> Copier</>
        }
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    background: 'rgba(201,147,58,0.06)',
    border: '1px solid rgba(201,147,58,0.2)',
    borderRadius: 6, padding: '0.35rem 0.6rem',
    maxWidth: '100%',
  },
  code: {
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '0.82rem', color: 'var(--gold)',
    wordBreak: 'break-all', flex: 1,
  },
  btn: {
    background: 'transparent', border: '1px solid rgba(201,147,58,0.3)',
    borderRadius: 4, padding: '0.2rem 0.55rem',
    color: 'var(--text-secondary)', fontSize: '0.75rem',
    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
    fontFamily: 'Georgia, serif',
    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
  },
  btnCopied: {
    color: '#6ec995', borderColor: 'rgba(110,201,149,0.4)',
  },
};

export default HashDisplay;
