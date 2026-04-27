import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { TaskCenter } from "@/components/layout/TaskCenter";
import { LogOut, Key, Check, X } from "lucide-react";
import { toast } from "sonner";

const C = {
  bg: "#06101E",
  s1: "#0C1A30",
  s2: "#112240",
  s3: "#162C52",
  border: "rgba(100,140,200,0.12)",
  amber: "#F5A623",
  teal: "#00C9A7",
  text: "#E2EAF4",
  muted: "#6B84A8",
  faint: "#2A3F60",
};

const NAV_ITEMS = [
  { group: "General", items: [
    { id: "/portal", label: "Overview", icon: "▦" },
    { id: "/portal/score", label: "Score Borrower", icon: "◎" },
    { id: "/portal/batch-scoring", label: "Batch Scoring", icon: "⊞" },
    { id: "/portal/history", label: "Borrower History", icon: "◷" },
  ]},
  { group: "Integration", items: [
    { id: "/portal/api-keys", label: "API Keys", icon: "⚿" },
    { id: "/portal/webhooks", label: "Webhooks", icon: "⌗" },
    { id: "/portal/usage", label: "Usage & Billing", icon: "⌁" },
  ]},
  { group: "Resources", items: [
    { id: "/portal/outcomes", label: "Submit Outcomes", icon: "✓" },
    { id: "/portal/reviews", label: "Human Review", icon: "👤" },
    { id: "/portal/consent", label: "Data Consent", icon: "🛡" },
    { id: "/portal/docs", label: "Developer Portal", icon: "◻" },
  ]},
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const pathname = location.pathname;
  const [active, setActive] = useState(pathname);
  const { user, logout } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    setActive(pathname);
  }, [pathname]);

  useEffect(() => {
    const saved = localStorage.getItem("credaly_api_key");
    if (saved) setApiKey(saved);
  }, []);

  const handleSaveKey = useCallback(() => {
    if (apiKey.trim()) {
      localStorage.setItem("credaly_api_key", apiKey.trim());
      setKeySaved(true);
      toast.success("API key saved");
      setTimeout(() => {
        setShowKeyInput(false);
        setKeySaved(false);
      }, 1500);
    }
  }, [apiKey]);

  const handleClearKey = useCallback(() => {
    localStorage.removeItem("credaly_api_key");
    setApiKey("");
    toast.info("API key cleared");
  }, []);

  return (
    <div
      className="flex min-h-screen font-sans"
      style={{ background: C.bg, color: C.text }}
    >
      {/* Sidebar */}
      <aside
        className="w-[220px] flex flex-col shrink-0 sticky top-0 h-screen"
        style={{
          background: C.s1,
          borderRight: `1px solid ${C.border}`,
        }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-[18px] border-b border-[rgba(100,140,200,0.12)]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: C.amber }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L16 14H2L9 2Z" fill="#06101E" opacity="0.9" />
                <circle cx="9" cy="12" r="2.5" fill="#06101E" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-bold text-credaly-text m-0 tracking-[0.02em]">
                Credaly
              </p>
              <p className="text-[9px] text-credaly-muted m-0 uppercase tracking-[0.06em]">
                Credit Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* User context */}
        <div className="px-4 pt-[14px] pb-[14px] border-b border-[rgba(100,140,200,0.12)] mx-2 mt-2">
          <p className="text-[9px] text-credaly-faint m-0 mb-1 uppercase tracking-[0.06em]">
            Logged in as
          </p>
          <p className="text-xs font-semibold text-credaly-text m-0 mb-0.5">
            {user?.name || "Guest"}
          </p>
          <p className="text-[10px] text-credaly-muted m-0">
            {user?.role === "admin" ? "System Admin" : "Partner Portal"}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 overflow-y-auto">
          {NAV_ITEMS.map((group) => (
            <div key={group.group} className="mb-[18px]">
              <p className="text-[10px] font-semibold text-credaly-faint m-0 mb-1.5 mx-3 uppercase tracking-[0.05em]">
                {group.group}
              </p>
              {group.items.map((item) => {
                const isActive = active === item.id;
                return (
                  <Link
                    key={item.id}
                    to={item.id}
                    className={`w-full flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-left text-xs transition-all duration-150 no-underline ${
                      isActive
                        ? "font-semibold"
                        : "font-normal"
                    }`}
                    style={{
                      background: isActive ? "rgba(245,166,35,0.1)" : "transparent",
                      border: `1px solid ${isActive ? "rgba(245,166,35,0.25)" : "transparent"}`,
                      color: isActive ? C.amber : C.muted,
                    }}
                  >
                    <span className="text-sm w-4 text-center">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom: API key status + env */}
        <div className="px-4 pt-[14px] pb-[14px] border-t border-[rgba(100,140,200,0.12)]">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-[7px] h-[7px] rounded-full inline-block"
              style={{ background: C.teal }}
            />
            <span className="text-[11px] text-credaly-muted">
              API Status: Operational
            </span>
          </div>
          {apiKey ? (
            <div className="flex items-center justify-between bg-[rgba(0,201,167,0.06)] border border-[rgba(0,201,167,0.18)] rounded-md px-2.5 py-1.5">
              <span className="text-[10px] text-credaly-teal font-mono truncate mr-1">
                {apiKey.slice(0, 12)}••••
              </span>
              <button
                onClick={() => { setShowKeyInput(true); setApiKey(""); }}
                className="text-[10px] text-credaly-teal bg-transparent border-none cursor-pointer font-semibold"
                aria-label="Change API key"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowKeyInput(true)}
              className="w-full flex items-center gap-1.5 bg-[rgba(245,166,35,0.06)] border border-[rgba(245,166,35,0.18)] rounded-md px-2.5 py-1.5 text-[10px] text-credaly-amber font-semibold cursor-pointer transition-colors hover:bg-[rgba(245,166,35,0.1)]"
              aria-label="Set API key"
            >
              <Key size={10} /> Set API Key
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header
          className="h-14 border-b border-[rgba(100,140,200,0.12)] flex items-center justify-end px-8 gap-5"
        >
          <TaskCenter />
          <div className="w-px h-5 bg-[rgba(100,140,200,0.12)]" />
          <button
            onClick={logout}
            className="bg-transparent border-none text-credaly-muted cursor-pointer flex items-center gap-2 text-xs hover:text-credaly-text transition-colors"
            aria-label="Logout"
          >
            <LogOut size={16} /> Logout
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>

      {/* API Key Input Modal */}
      {showKeyInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" role="dialog" aria-modal="true" aria-label="Enter API Key">
          <div className="bg-credaly-s1 border border-[rgba(100,140,200,0.12)] rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-credaly-text flex items-center gap-2">
                <Key size={16} className="text-credaly-amber" />
                API Key
              </h3>
              <button
                onClick={() => { setShowKeyInput(false); setKeySaved(false); setApiKey(localStorage.getItem("credaly_api_key") || ""); }}
                className="bg-transparent border-none text-credaly-muted cursor-pointer hover:text-credaly-text"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-credaly-muted mb-3">
              Enter your scoring API key to authenticate requests. This key is stored locally in your browser.
            </p>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk_live_xxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-credaly-s2 border border-[rgba(100,140,200,0.12)] rounded-lg px-3.5 py-2.5 text-sm text-credaly-text outline-none font-mono mb-4 focus:border-credaly-amber/40 focus:ring-1 focus:ring-credaly-amber/15 transition-colors"
              aria-label="API Key"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveKey}
                disabled={!apiKey.trim()}
                className="flex-1 bg-credaly-amber text-credaly-bg border-none rounded-lg py-2.5 text-sm font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              >
                {keySaved ? <><Check size={14} /> Saved</> : "Save Key"}
              </button>
              {localStorage.getItem("credaly_api_key") && (
                <button
                  onClick={handleClearKey}
                  className="px-4 bg-transparent border border-[rgba(239,68,68,0.2)] text-credaly-danger rounded-lg text-sm font-semibold cursor-pointer hover:bg-[rgba(239,68,68,0.1)] transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
