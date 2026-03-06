import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export const useToast = () => useContext(ToastContext);

let counter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={styles.container}>
        {toasts.map(toast => (
          <div key={toast.id} style={{ ...styles.toast, ...styles[toast.type] }}>
            <span style={styles.icon}>
              {toast.type === 'success' && <CheckCircle size={16} />}
              {toast.type === 'error' && <AlertCircle size={16} />}
              {toast.type === 'info' && <Info size={16} />}
            </span>
            <span style={styles.message}>{toast.message}</span>
            <button style={styles.close} onClick={() => remove(toast.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: '1.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    zIndex: 9999,
    width: 'calc(100% - 2rem)',
    maxWidth: 420,
    pointerEvents: 'none',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.85rem 1rem',
    borderRadius: 10,
    border: '1px solid',
    fontFamily: 'Georgia, serif',
    fontSize: '0.9rem',
    lineHeight: 1.4,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    animation: 'toastIn 0.3s cubic-bezier(0.4,0,0.2,1)',
    pointerEvents: 'all',
  },
  success: {
    background: 'rgba(22,25,31,0.97)',
    borderColor: 'rgba(201,147,58,0.5)',
    color: '#C9933A',
  },
  error: {
    background: 'rgba(22,25,31,0.97)',
    borderColor: 'rgba(138,45,45,0.5)',
    color: '#e07070',
  },
  info: {
    background: 'rgba(22,25,31,0.97)',
    borderColor: 'rgba(45,95,138,0.5)',
    color: '#6aaee0',
  },
  icon: { flexShrink: 0, display: 'flex', alignItems: 'center' },
  message: { flex: 1 },
  close: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit',
    opacity: 0.6,
    padding: '0.1rem',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
};
