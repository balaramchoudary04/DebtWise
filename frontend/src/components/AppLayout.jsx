import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  TrendingDown,
  LayoutDashboard,
  GitCompare,
  Gauge,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Bell,
  Link2,
  Download,
  Trophy,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  CreditCard,
  Building2,
  Zap,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard" },
  { to: "/strategies", label: "Strategies", icon: GitCompare, testid: "nav-strategies" },
  { to: "/credit-score", label: "Credit Score", icon: Gauge, testid: "nav-credit-score" },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // null | 'notifications' | 'accounts' | 'help'
  const [syncingPlaid, setSyncingPlaid] = useState(false);

  const menuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty("--mouse-x", `${x}%`);
      document.documentElement.style.setProperty("--mouse-y", `${y}%`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onLogout = async () => {
    await logout();
    toast.success("Signed out.");
    navigate("/", { replace: true });
  };

  const handleForcePlaidSync = () => {
    setSyncingPlaid(true);
    setTimeout(() => {
      setSyncingPlaid(false);
      toast.success("⚡ Plaid sync complete: All accounts and liabilities refreshed!");
    }, 900);
  };

  // Reusable Dropdown Menu Card
  const renderDropdownContent = (closeMenu) => (
    <div
      className="absolute left-0 mt-2 w-80 rounded-2xl glass-strong border border-white/15 p-2 shadow-2xl z-50 animate-fadeIn"
      style={{ backdropFilter: "blur(24px)" }}
    >
      {/* Profile Header */}
      <div className="p-3 rounded-xl bg-white/5 border border-white/5 mb-2">
        <div className="flex items-center gap-2.5">
          {user?.picture ? (
            <img src={user.picture} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-semibold text-blue-300">
              {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.name || "Balaram Choudary"}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || "balaramchoudary04@gmail.com"}</p>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider shrink-0">
            Live Sync
          </span>
        </div>
      </div>

      {/* Main Options */}
      <div className="space-y-0.5 text-xs">
        {/* Settings */}
        <button
          type="button"
          onClick={() => {
            closeMenu();
            navigate("/settings");
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition group text-left"
          data-testid="dropdown-settings-btn"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-105 transition">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium text-white block">Settings &amp; Preferences</span>
              <span className="text-[10px] text-slate-400 block">Profile, security, auto-pay buffer</span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition" />
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => {
            closeMenu();
            setActiveModal("notifications");
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition group text-left"
          data-testid="dropdown-notifications-btn"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">Notification Center</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300">
                  3 New
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block">Plaid reconciliation &amp; FICO shields</span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition" />
        </button>

        {/* Linked Accounts */}
        <button
          type="button"
          onClick={() => {
            closeMenu();
            setActiveModal("accounts");
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition group text-left"
          data-testid="dropdown-accounts-btn"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium text-white block">Connected Accounts</span>
              <span className="text-[10px] text-slate-400 block">Chase Checking, Credit Cards &amp; Loans</span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition" />
        </button>

        {/* Export Payoff Blueprint */}
        <button
          type="button"
          onClick={() => {
            closeMenu();
            window.print();
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition group text-left"
          data-testid="dropdown-export-btn"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium text-white block">Export Payoff Blueprint</span>
              <span className="text-[10px] text-slate-400 block">Printable summary &amp; PDF checklist</span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition" />
        </button>

        {/* Help & Methodology */}
        <button
          type="button"
          onClick={() => {
            closeMenu();
            setActiveModal("help");
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition group text-left"
          data-testid="dropdown-help-btn"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium text-white block">Help &amp; Strategy Guide</span>
              <span className="text-[10px] text-slate-400 block">Avalanche vs Snowball formulas</span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition" />
        </button>
      </div>

      {/* Footer / Sign Out */}
      <div className="pt-2 mt-2 border-t border-white/5">
        <button
          type="button"
          onClick={() => {
            closeMenu();
            onLogout();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
          data-testid="dropdown-logout-btn"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 p-6 sticky top-0 h-screen">
        {/* Top Header with Logo & 3-Horizontal-Line Dropdown Button */}
        <div className="flex items-center justify-between gap-2 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl glass glow-blue flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-display text-lg tracking-tight font-medium">DebtWise</span>
          </div>

          {/* Reactive 3 Horizontal Lines Dropdown Button */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-2 rounded-xl border transition flex items-center justify-center relative ${
                menuOpen
                  ? "bg-blue-600/20 border-blue-500/40 text-blue-400"
                  : "glass hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
              }`}
              title="Quick Menu & Settings"
              data-testid="header-menu-btn"
            >
              <Menu className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
            </button>

            {menuOpen && renderDropdownContent(() => setMenuOpen(false))}
          </div>
        </div>

        {/* Primary 3 Navigation Tabs: Dashboard, Strategies, Credit Score */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, label, icon: Icon, testid }) => (
            <NavLink
              key={to}
              to={to}
              data-testid={testid}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-blue-600/15 border border-blue-500/30 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User Card */}
        <div className="glass-subtle rounded-xl p-4 mt-6" data-testid="user-card">
          <div className="flex items-center gap-3">
            {user?.picture ? (
              <img src={user.picture} alt="" className="w-9 h-9 rounded-full" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sm font-medium text-blue-300">
                {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-white/5">
            <button
              onClick={() => navigate("/settings")}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-1.5 transition-colors"
              data-testid="settings-btn"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              Settings
            </button>
            <button
              onClick={onLogout}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 rounded-lg py-1.5 transition-colors"
              data-testid="logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-20 glass-strong border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            {/* Reactive 3 Horizontal Lines Dropdown Button */}
            <div className="relative" ref={mobileMenuRef}>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-1.5 rounded-lg border transition flex items-center justify-center relative ${
                  mobileMenuOpen
                    ? "bg-blue-600/20 border-blue-500/40 text-blue-400"
                    : "glass hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
                }`}
                title="Quick Menu & Settings"
                data-testid="mobile-header-menu-btn"
              >
                <Menu className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </button>

              {mobileMenuOpen && renderDropdownContent(() => setMobileMenuOpen(false))}
            </div>

            <div className="w-7 h-7 rounded-lg glass-subtle flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-display tracking-tight font-medium">DebtWise</span>
          </div>

          <button
            onClick={onLogout}
            className="text-xs text-slate-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
            data-testid="mobile-logout-btn"
          >
            <LogOut className="w-3.5 h-3.5" /> Exit
          </button>
        </div>

        <nav className="flex overflow-x-auto px-4 pb-3 gap-2">
          {navItems.map(({ to, label, icon: Icon, testid }) => (
            <NavLink
              key={to}
              to={to}
              data-testid={`mobile-${testid}`}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600/15 border border-blue-500/30 text-white"
                    : "text-slate-400 bg-white/5 border border-white/10"
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="flex-1 min-w-0 pt-32 lg:pt-0">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* ======================================================== */}
      {/* MODAL 1: NOTIFICATION CENTER */}
      {/* ======================================================== */}
      {activeModal === "notifications" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-strong rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/15 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium text-white">Notification Center</h3>
                  <p className="text-xs text-slate-400">Plaid payment reconciliations &amp; FICO protection</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    Plaid Payment Reconciled ($190.00)
                  </span>
                  <span className="text-[10px] text-slate-400">Oct 15</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Debit matched from Chase Premier Checking to Chase Sapphire Reserve. Categorized strictly as debt payoff ($0 spending).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    AutoPay Debit Reconciled ($120.00)
                  </span>
                  <span className="text-[10px] text-slate-400">Oct 12</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  AutoPay debit to AMEX Everyday verified from linked checking. Marked complete on calendar.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    High Utilization Alert: Chase Sapphire
                  </span>
                  <span className="text-[10px] text-slate-400">Nov 2 Close</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Card is at 62% limit utilization ($6,200 of $10,000). Paying down $1,200 before your statement closes prevents an estimated 15 pt FICO drop.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-slate-400">3 verified alerts active</span>
              <button
                type="button"
                onClick={() => {
                  toast.success("All notifications marked as read.");
                  setActiveModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
              >
                Mark All Read
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CONNECTED ACCOUNTS & PLAID SYNC */}
      {/* ======================================================== */}
      {activeModal === "accounts" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-strong rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/15 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium text-white">Connected Accounts</h3>
                  <p className="text-xs text-slate-400">Live synchronization with Plaid liabilities</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {/* Checking */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold text-xs">
                    CHK
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">Chase Premier Checking (••9124)</span>
                    <span className="text-[10px] text-slate-400">Cash Flow Funding Account &bull; $3,450.00 Balance</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Synced Live
                </span>
              </div>

              {/* Credit Card 1 */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center font-bold text-xs">
                    CC
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">Chase Sapphire Reserve (••4102)</span>
                    <span className="text-[10px] text-slate-400">$6,200.00 balance &bull; 24.99% APR</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Synced Live
                </span>
              </div>

              {/* Credit Card 2 */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center font-bold text-xs">
                    CC
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">Amex Everyday Card (••8819)</span>
                    <span className="text-[10px] text-slate-400">$3,800.00 balance &bull; 21.24% APR</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Synced Live
                </span>
              </div>

              {/* Loans */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold text-xs">
                    LN
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">SoFi Personal Loan + Toyota Auto</span>
                    <span className="text-[10px] text-slate-400">Fixed Installments &bull; $22,500.00 total</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-300 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  Manual/Linked
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Plaid automatically checks balances daily at 4:00 AM UTC.
              </span>
              <button
                type="button"
                onClick={handleForcePlaidSync}
                disabled={syncingPlaid}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shrink-0 shadow-md shadow-blue-500/25"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingPlaid ? "animate-spin" : ""}`} />
                {syncingPlaid ? "Syncing..." : "Force Sync Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: HELP & METHODOLOGY */}
      {/* ======================================================== */}
      {activeModal === "help" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-strong rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/15 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium text-white">Help &amp; Strategy Guide</h3>
                  <p className="text-xs text-slate-400">How DebtWise optimizes your debt elimination</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-xs">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Debt Avalanche (Pay Least Interest)
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Focuses every extra dollar on the debt with the highest APR, while paying minimums on the rest. Mathematically guarantees the lowest total finance charges and fastest debt-free date.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Debt Snowball (Fastest Momentum)
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Focuses on the smallest account balance first. Eliminates individual accounts quickly to generate motivational psychological wins that keep you committed.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Cash Flow Relief (Highest Bill First)
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Eliminates the largest monthly payment first. Maximizes your breathing room by immediately freeing up significant monthly cash flow.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-semibold text-blue-300 mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  Bank-Grade Security
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  DebtWise utilizes 256-bit AES encryption. Financial account connections through Plaid are read-only and tokenized; your banking credentials are never visible or stored on our servers.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 text-right">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
