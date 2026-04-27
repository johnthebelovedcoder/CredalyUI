import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Activity,
  Brain,
  Building2,
  ShieldCheck,
  Settings,
  ChevronDown,
} from 'lucide-react';

const C = {
  amber: '#F5A623',
  amberFaint: 'rgba(245,166,35,0.1)',
  amberBorder: 'rgba(245,166,35,0.25)',
  teal: '#00C9A7',
  bg: '#06101E',
  s1: '#0C1A30',
  s2: '#112240',
  border: 'rgba(100,140,200,0.12)',
  text: '#E2EAF4',
  muted: '#6B84A8',
  faint: '#2A3F60',
};

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/pipelines', label: 'Pipeline Health', icon: Activity },
  { href: '/models', label: 'Model Performance', icon: Brain },
  { href: '/clients', label: 'Client Management', icon: Building2 },
  { href: '/audit', label: 'Consent Audit', icon: ShieldCheck },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <aside
      style={{
        width: 256,
        background: C.s1,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        padding: 0,
        flexShrink: 0,
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 20px 18px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: C.amber,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Brain className="w-5 h-5" style={{ color: C.bg }} />
          </div>
          <div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.text,
                margin: 0,
                letterSpacing: "0.02em",
                display: "block",
              }}
            >
              Credaly
            </span>
            <span
              style={{
                fontSize: 9,
                color: C.muted,
                margin: 0,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                display: "block",
              }}
            >
              Predictive Credit Platform
            </span>
          </div>
        </div>
      </div>

      {/* Operator context */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: `1px solid ${C.border}`,
          margin: '0 8px',
          marginTop: 8,
        }}
      >
        <p
          style={{ fontSize: 9, color: C.faint, margin: '0 0 4px', textTransform: "uppercase", letterSpacing: "0.06em" }}
        >
          Logged in as
        </p>
        <p style={{ fontSize: 12, fontWeight: 600, color: C.text, margin: '0 0 2px' }}>
          Platform Ops
        </p>
        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>
          operator@credaly.io
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              to={item.href}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                background: isActive ? C.amberFaint : 'transparent',
                border: `1px solid ${isActive ? C.amberBorder : 'transparent'}`,
                color: isActive ? C.amber : C.muted,
                cursor: "pointer",
                textAlign: "left",
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                marginBottom: 2,
                transition: "all 0.15s",
                textDecoration: 'none',
              }}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '14px 16px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              background: C.s2,
              color: C.text,
            }}
          >
            OP
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 500, margin: 0, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Platform Ops
            </p>
            <p style={{ fontSize: 10, margin: 0, color: C.faint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Platform Admin
            </p>
          </div>
          <ChevronDown className="w-4 h-4 shrink-0" style={{ color: C.muted }} />
        </div>
      </div>
    </aside>
  );
}
