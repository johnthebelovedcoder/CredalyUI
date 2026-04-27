import { useHealthCheck } from '@/lib/hooks';
import { formatDate } from '@/lib/utils-format';
import { CheckCircle2, AlertCircle, XCircle, LogOut, User, Loader2 } from 'lucide-react';
import { TaskCenter } from './TaskCenter';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

const C = {
  border: 'rgba(100,140,200,0.12)',
  text: '#E2EAF4',
  muted: '#6B84A8',
  faint: '#2A3F60',
  teal: '#00C9A7',
  amber: '#F5A623',
  amberFaint: 'rgba(245,166,35,0.1)',
  amberBorder: 'rgba(245,166,35,0.18)',
  red: '#EF4444',
  bg: '#06101E',
  s1: '#0C1A30',
  s2: '#112240',
};

export function Header() {
  const { data: health } = useHealthCheck();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      window.location.href = '/login';
    } catch {
      // Always redirect to login even if backend call fails
      window.location.href = '/login';
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 40,
        borderBottom: `1px solid ${C.border}`,
        background: C.bg, 
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: C.text, fontFamily: "Outfit, sans-serif" }}>
          Credaly Admin
        </h1>
        {/* Environment badge */}
        <div
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            background: C.amberFaint,
            border: `1px solid ${C.amberBorder}`,
            color: C.amber,
          }}
        >
          {import.meta.env.VITE_ENVIRONMENT || 'PRODUCTION'}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* Health indicator */}
        {health && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginRight: 12 }}>
            {health.status === 'ok' ? (
              <CheckCircle2 className="w-4 h-4" style={{ color: C.teal }} />
            ) : health.status === 'degraded' ? (
              <AlertCircle className="w-4 h-4" style={{ color: C.amber }} />
            ) : (
              <XCircle className="w-4 h-4" style={{ color: C.red }} />
            )}
            <span style={{ textTransform: "capitalize", color: C.muted }}>
              {health.status}
            </span>
          </div>
        )}

        <TaskCenter />

        <div style={{ width: 1, height: 24, background: C.border }} />

        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="hidden md:block" style={{ textAlign: "right" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: 0 }}>{user.name}</p>
              <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>{user.role.toUpperCase()}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                background: C.s2,
                border: `1px solid ${C.border}`,
                color: C.red,
                padding: "8px",
                borderRadius: 8,
                cursor: loggingOut ? 'wait' : 'pointer',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: loggingOut ? 0.5 : 1,
              }}
              title="Logout"
              aria-label="Log out"
            >
              {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
