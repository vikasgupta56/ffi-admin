import { useEffect } from 'react';

export const Spinner = () => <div className="center-block"><div className="spinner" /></div>;

export function Modal({ title, children, onClose, footer, wide }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head"><h3>{title}</h3><button className="x" onClick={onClose} aria-label="Close">×</button></div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export const PhaseChip = ({ phase, sent }) => (
  <span className={`chip ${phase}`}>{phase === 'live' ? '● Live now' : phase === 'upcoming' ? 'Upcoming' : sent ? 'Past · certificates sent' : 'Past'}</span>
);
export const ModeChip = ({ mode }) => <span className={`chip mode ${mode}`}>{mode === 'online' ? 'Online' : 'Offline'}</span>;

export const Empty = ({ children }) => <div className="empty">{children}</div>;
export const ErrorBox = ({ error }) => (error ? <div className="alert err" role="alert">{error}</div> : null);
