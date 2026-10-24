import React, { useEffect, useState } from "react";
import { api, fmtMoney } from "../lib/api";
import { STRATEGIES, GlassTooltip } from "../lib/constants";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Slider } from "../components/ui/slider";
import PlaidConnectButton from "../components/PlaidConnectButton";
import {
  ArrowRight,
  Trophy,
  Zap,
  Target,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Clock,
  TrendingDown,
  DollarSign,
  CalendarHeart,
  Layers,
  Table as TableIcon,
  PlusCircle,
  Wallet,
  CreditCard,
  PiggyBank,
  Building2,
  X,
  ShieldCheck,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export default function Strategies() {
  const [subTab, setSubTab] = useState("discover"); // "discover" | "compare"
  const [extra, setExtra] = useState(0);
  const [compare, setCompare] = useState(null);
  const [debts, setDebts] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState("save_money"); // "save_money" | "motivation" | "cash_flow"
  const [loading, setLoading] = useState(true);
  const [selectedPlanDetail, setSelectedPlanDetail] = useState(null); // null | 'avalanche' | 'snowball' | 'highest_payment'
  const [activeStrategyKey, setActiveStrategyKey] = useState(() => {
    return localStorage.getItem("debtwise_active_strategy") || "avalanche";
  });
  const navigate = useNavigate();

  const fetchDebtsAndCompare = async (val = extra) => {
    setLoading(true);
    try {
      const [debtsRes, compareRes] = await Promise.all([
        api.get("/debts"),
        api.post("/strategies/compare", null, { params: { extra_payment: val } }),
      ]);
      setDebts(debtsRes.data || []);
      setCompare(compareRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebtsAndCompare(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onExtraCommit = (val) => {
    setExtra(val[0]);
    fetchDebtsAndCompare(val[0]);
  };

  const strategies = compare?.strategies || {};
  const visible = STRATEGIES.filter((s) => s.key !== "custom");

  // Pick cheapest strategy (least interest)
  const best = visible.reduce(
    (acc, s) => {
      const r = strategies[s.key];
      if (!r) return acc;
      if (!acc || r.total_interest < acc.interest) {
        return { key: s.key, interest: r.total_interest, months: r.months };
      }
      return acc;
    },
    null
  );

  const interestData = visible.map((s) => ({
    name: s.label,
    interest: strategies[s.key]?.total_interest || 0,
    color: s.color,
  }));

  const timelineData = (strategies.avalanche?.schedule || []).map((p, i) => ({
    month: p.month,
    avalanche: p.total_remaining,
    snowball: strategies.snowball?.schedule?.[i]?.total_remaining ?? null,
    highest_payment: strategies.highest_payment?.schedule?.[i]?.total_remaining ?? null,
  }));

  const handleActivateStrategy = (stratKey) => {
    setActiveStrategyKey(stratKey);
    localStorage.setItem("debtwise_active_strategy", stratKey);
    const meta = STRATEGIES.find((s) => s.key === stratKey);
    toast.success(`Active plan updated to ${meta?.label || stratKey}!`);
    if (selectedPlanDetail) setSelectedPlanDetail(null);
  };

  const hasNoAccounts = !loading && debts.length === 0;

  return (
    <div data-testid="strategies-page" className="space-y-8 animate-fadeIn">
      {/* Header with Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <p className="text-label mb-2">Debt Payoff Engine</p>
          <h1 className="font-display text-4xl sm:text-5xl font-light tracking-tighter text-white">
            Strategies
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-xl">
            Discover, analyze, and compare mathematically optimal payoff plans tailored to your debts.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/10 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSubTab("discover")}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-1.5 ${
              subTab === "discover"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Discover Plans
          </button>
          <button
            type="button"
            onClick={() => setSubTab("compare")}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-1.5 ${
              subTab === "compare"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Compare Strategies
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      <!-- ONBOARDING GATE: WHEN NO ACCOUNTS CONNECTED -->
      {/* ======================================================== */}
      {hasNoAccounts ? (
        <div className="glass rounded-3xl p-6 sm:p-10 border border-blue-500/30 relative overflow-hidden animate-fadeIn">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-4 h-4" />
              Account Connection Required
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-light text-white tracking-tight">
              Connect Your Accounts to Unlock Custom Strategies
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              DebtWise generates customized mathematical payoff blueprints based on your real balances, interest APRs, and minimum payments. Connect your financial accounts below to calculate your personalized plan:
            </p>

            {/* 4 Account Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
              <div className="glass-subtle rounded-2xl p-4 border border-blue-500/20 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">1. Checking Accounts</span>
                    <span className="text-[10px] uppercase font-bold text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded">
                      Required
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Calculates your monthly cash flow surplus and automatically tracks debt payoff transfers via Plaid.
                  </p>
                </div>
              </div>

              <div className="glass-subtle rounded-2xl p-4 border border-red-500/20 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">2. Credit Card Accounts</span>
                    <span className="text-[10px] uppercase font-bold text-red-300 bg-red-500/20 px-1.5 py-0.5 rounded">
                      Required
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Imports revolving balances, payment due dates, and exact APRs (e.g. 24.99%) to target high interest.
                  </p>
                </div>
              </div>

              <div className="glass-subtle rounded-2xl p-4 border border-amber-500/20 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">3. Installment Debts</span>
                    <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                      Required
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Connect auto loans, personal loans, student debt, and mortgages to map full amortization trajectories.
                  </p>
                </div>
              </div>

              <div className="glass-subtle rounded-2xl p-4 border border-emerald-500/20 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <PiggyBank className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">4. Savings Accounts</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                      Optional
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Protects your emergency buffer so you never over-allocate debt payoffs and remain safe from shocks.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <PlaidConnectButton
                onLinked={() => fetchDebtsAndCompare()}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition"
              >
                <Zap className="w-4 h-4" />
                Connect Accounts via Plaid Link (Instant)
              </PlaidConnectButton>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-sm font-medium transition flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Add Debts on Dashboard
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ======================================================== */}
          {/* TAB 1: DISCOVER STRATEGIES VIEW */}
          {/* ======================================================== */}
          {subTab === "discover" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Goal Selector */}
              <div className="glass rounded-xl p-4" data-testid="help-me-choose-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold">
                      Your Main Goal
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedGoal("save_money")}
                      className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all text-center flex items-center justify-center gap-1.5 ${
                        selectedGoal === "save_money"
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/40"
                          : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                      data-testid="goal-save-money"
                    >
                      <span>💰</span> Pay Least Interest
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedGoal("motivation")}
                      className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all text-center flex items-center justify-center gap-1.5 ${
                        selectedGoal === "motivation"
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/40"
                          : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                      data-testid="goal-motivation"
                    >
                      <span>⚡</span> Quick Wins First
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedGoal("cash_flow")}
                      className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all text-center flex items-center justify-center gap-1.5 ${
                        selectedGoal === "cash_flow"
                          ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/40"
                          : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                      data-testid="goal-cash-flow"
                    >
                      <span>💵</span> Lower Monthly Bills
                    </button>
                  </div>
                </div>
              </div>

              {/* Extra payment slider */}
              <div className="glass rounded-xl p-5" data-testid="extra-payment-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-label">Extra monthly payment</p>
                    <p className="font-display text-2xl sm:text-3xl font-light tracking-tight mt-1">
                      {fmtMoney(extra)} <span className="text-xs text-slate-500">/ month</span>
                    </p>
                  </div>
                  {best && (
                    <div className="glass-subtle rounded-lg px-3 py-1.5 flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-slate-300">
                        Cheapest:{" "}
                        <span className="text-white font-medium">
                          {STRATEGIES.find((s) => s.key === best.key)?.label}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
                <Slider
                  defaultValue={[0]}
                  min={0}
                  max={2000}
                  step={25}
                  onValueCommit={onExtraCommit}
                  className="mt-1"
                  data-testid="extra-payment-slider"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-2">
                  <span>+$0/mo</span>
                  <span>+$1,000/mo</span>
                  <span>+$2,000/mo</span>
                </div>
              </div>

              {/* Strategy cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {STRATEGIES.map((s) => {
                  if (s.key === "custom") {
                    return (
                      <button
                        key={s.key}
                        onClick={() => navigate("/strategies/custom")}
                        className="text-left glass rounded-xl p-5 hover:bg-slate-800/50 hover:border-white/20 transition-all flex flex-col justify-between"
                        data-testid={`strategy-${s.key}`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                              {s.sublabel}
                            </span>
                          </div>
                          <h3 className="font-display text-xl font-medium tracking-tight mb-2 text-white">
                            {s.label}
                          </h3>
                          <p className="text-xs text-slate-300 leading-relaxed mb-4">{s.desc}</p>

                          <div className="glass-subtle rounded-lg p-3 text-xs text-slate-400 space-y-1 border border-white/5">
                            <p className="font-medium text-slate-200">Custom Priority</p>
                            <p className="text-[11px] text-slate-400">
                              Drag to order debts or allocate extra payments freely.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-blue-400 mt-4 pt-3 border-t border-white/5">
                          Build custom plan <ArrowRight className="w-3 h-3" />
                        </div>
                      </button>
                    );
                  }
                  const r = strategies[s.key];
                  const isBest = best?.key === s.key;
                  const isActive = activeStrategyKey === s.key;
                  const matchesGoal =
                    (selectedGoal === "save_money" && s.key === "avalanche") ||
                    (selectedGoal === "motivation" && s.key === "snowball") ||
                    (selectedGoal === "cash_flow" && s.key === "highest_payment");

                  return (
                    <div
                      key={s.key}
                      className={`text-left glass rounded-xl p-5 transition-all flex flex-col justify-between ${
                        isActive
                          ? "border-blue-500/80 shadow-[0_0_25px_rgba(37,99,235,0.3)] ring-1 ring-blue-500/50"
                          : matchesGoal
                          ? "border-blue-500/60 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                          : isBest
                          ? "border-blue-500/30"
                          : "border-white/10"
                      }`}
                      data-testid={`strategy-${s.key}`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                            {s.sublabel}
                          </span>
                          {isActive ? (
                            <span className="text-[10px] uppercase tracking-wider text-blue-300 bg-blue-500/20 border border-blue-400/40 rounded-full px-2.5 py-0.5 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Active Plan
                            </span>
                          ) : matchesGoal ? (
                            <span className="text-[10px] uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-2 py-0.5 font-bold">
                              Goal Match
                            </span>
                          ) : isBest ? (
                            <span className="text-[10px] uppercase tracking-wider text-blue-300 bg-blue-500/15 border border-blue-500/30 rounded-full px-2 py-0.5 font-bold">
                              Lowest Cost
                            </span>
                          ) : null}
                        </div>
                        <h3 className="font-display text-xl font-medium tracking-tight mb-2 text-white">
                          {s.label}
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed mb-4">{s.desc}</p>

                        {r ? (
                          <div className="glass-subtle rounded-lg p-3 space-y-2 border border-white/5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                                Debt-Free
                              </span>
                              <span className="text-sm font-semibold text-blue-300 font-mono">
                                {r.payoff_date || "—"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                                Interest
                              </span>
                              <span className="text-xs font-medium text-slate-200 font-mono">
                                {fmtMoney(r.total_interest)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                                Duration
                              </span>
                              <span className="text-xs font-medium text-slate-200 font-mono">
                                {r.months} months
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">Connect accounts to calculate.</p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPlanDetail(s.key)}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition"
                        >
                          View plan details <ArrowRight className="w-3 h-3" />
                        </button>
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => handleActivateStrategy(s.key)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
                          >
                            Set Active
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Charts */}
              {timelineData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="glass rounded-2xl p-6" data-testid="chart-interest-compare">
                    <div className="mb-6">
                      <p className="text-label">Interest paid</p>
                      <h3 className="font-display text-lg font-medium mt-1">Cost of each strategy</h3>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={interestData}>
                          <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis
                            stroke="#475569"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => fmtMoney(v)}
                            width={70}
                          />
                          <Tooltip content={<GlassTooltip formatter={(v) => fmtMoney(v)} />} />
                          <Bar dataKey="interest" radius={[8, 8, 0, 0]}>
                            {interestData.map((e, i) => (
                              <Cell
                                key={i}
                                fill={e.color}
                                style={{ filter: `drop-shadow(0 0 6px ${e.color})` }}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-6" data-testid="chart-timeline-compare">
                    <div className="mb-6">
                      <p className="text-label">Balance over time</p>
                      <h3 className="font-display text-lg font-medium mt-1">Payoff trajectory</h3>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timelineData}>
                          <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis
                            stroke="#475569"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => fmtMoney(v)}
                            width={70}
                          />
                          <Tooltip content={<GlassTooltip formatter={(v) => fmtMoney(v)} />} />
                          <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                          <Line type="monotone" dataKey="avalanche" name="Save Most Money" stroke="#2563EB" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="snowball" name="Fastest Motivation" stroke="#10B981" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="highest_payment" name="Cash Flow Relief" stroke="#F59E0B" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: COMPARE STRATEGIES HEAD-TO-HEAD */}
          {/* ======================================================== */}
          {subTab === "compare" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Extra payment dial for comparison */}
              <div className="glass rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-medium text-white">
                    Compare All Strategies Side-by-Side
                  </h3>
                  <p className="text-xs text-slate-400">
                    See how total interest, payoff speed, and monthly cash flow differ with extra payments.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Extra monthly:</span>
                  <span className="font-mono text-sm font-bold text-blue-400 px-3 py-1 rounded-lg bg-blue-600/15 border border-blue-500/30">
                    +{fmtMoney(extra)}/mo
                  </span>
                </div>
              </div>

              {/* Head-to-Head Comparison Table */}
              <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-slate-900/60">
                        <th className="py-4 px-5 text-slate-400 uppercase tracking-wider font-semibold w-1/4">
                          Metric / Trait
                        </th>
                        <th className="py-4 px-4 text-blue-400 font-bold border-l border-white/5 bg-blue-950/20">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                            Save Most Money (Avalanche)
                          </div>
                        </th>
                        <th className="py-4 px-4 text-emerald-400 font-bold border-l border-white/5 bg-emerald-950/20">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            Fastest Motivation (Snowball)
                          </div>
                        </th>
                        <th className="py-4 px-4 text-amber-400 font-bold border-l border-white/5 bg-amber-950/20">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            Cash Flow Relief (Highest Bill)
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-5 font-medium text-slate-300">Target Priority</td>
                        <td className="py-3.5 px-4 text-slate-200 border-l border-white/5 font-medium">
                          Highest APR % First
                        </td>
                        <td className="py-3.5 px-4 text-slate-200 border-l border-white/5 font-medium">
                          Lowest Balance $ First
                        </td>
                        <td className="py-3.5 px-4 text-slate-200 border-l border-white/5 font-medium">
                          Highest Monthly Min $ First
                        </td>
                      </tr>
                      <tr className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-5 font-medium text-slate-300">Projected Debt-Free</td>
                        <td className="py-3.5 px-4 font-bold text-blue-400 border-l border-white/5 text-sm font-mono">
                          {strategies.avalanche?.payoff_date || "—"}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-400 border-l border-white/5 text-sm font-mono">
                          {strategies.snowball?.payoff_date || "—"}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-amber-400 border-l border-white/5 text-sm font-mono">
                          {strategies.highest_payment?.payoff_date || "—"}
                        </td>
                      </tr>
                      <tr className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-5 font-medium text-slate-300">Total Duration</td>
                        <td className="py-3.5 px-4 text-white border-l border-white/5 font-mono font-medium">
                          {strategies.avalanche ? `${strategies.avalanche.months} Months` : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-white border-l border-white/5 font-mono font-medium">
                          {strategies.snowball ? `${strategies.snowball.months} Months` : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-white border-l border-white/5 font-mono font-medium">
                          {strategies.highest_payment ? `${strategies.highest_payment.months} Months` : "—"}
                        </td>
                      </tr>
                      <tr className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-5 font-medium text-slate-300">Total Interest Paid</td>
                        <td className="py-3.5 px-4 font-bold text-blue-400 border-l border-white/5 font-mono text-sm">
                          {strategies.avalanche ? fmtMoney(strategies.avalanche.total_interest) : "—"}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-400 border-l border-white/5 font-mono text-sm">
                          {strategies.snowball ? fmtMoney(strategies.snowball.total_interest) : "—"}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-amber-400 border-l border-white/5 font-mono text-sm">
                          {strategies.highest_payment ? fmtMoney(strategies.highest_payment.total_interest) : "—"}
                        </td>
                      </tr>
                      <tr className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-5 font-medium text-slate-300">Mathematical Rank</td>
                        <td className="py-3.5 px-4 text-blue-400 border-l border-white/5 font-bold">
                          🏆 1st (Minimum Interest)
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 border-l border-white/5">
                          2nd (Slightly more interest)
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 border-l border-white/5">
                          2nd (Balances cash flow)
                        </td>
                      </tr>
                      <tr className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-5 font-medium text-slate-300">Psychological Motivation</td>
                        <td className="py-3.5 px-4 text-slate-300 border-l border-white/5">High</td>
                        <td className="py-3.5 px-4 text-emerald-400 border-l border-white/5 font-bold">
                          ⚡ 1st (Fastest account wins)
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 border-l border-white/5">High</td>
                      </tr>
                      <tr className="bg-slate-900/40">
                        <td className="py-4 px-5 font-medium text-slate-400">Action</td>
                        <td className="py-4 px-4 border-l border-white/5">
                          <button
                            type="button"
                            onClick={() => handleActivateStrategy("avalanche")}
                            className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition text-xs shadow-md"
                          >
                            {activeStrategyKey === "avalanche" ? "Active ✓" : "Activate Avalanche"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedPlanDetail("avalanche")}
                            className="w-full text-center text-[10px] text-blue-400 hover:underline mt-1.5"
                          >
                            View details &rarr;
                          </button>
                        </td>
                        <td className="py-4 px-4 border-l border-white/5">
                          <button
                            type="button"
                            onClick={() => handleActivateStrategy("snowball")}
                            className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition text-xs shadow-md"
                          >
                            {activeStrategyKey === "snowball" ? "Active ✓" : "Activate Snowball"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedPlanDetail("snowball")}
                            className="w-full text-center text-[10px] text-emerald-400 hover:underline mt-1.5"
                          >
                            View details &rarr;
                          </button>
                        </td>
                        <td className="py-4 px-4 border-l border-white/5">
                          <button
                            type="button"
                            onClick={() => handleActivateStrategy("highest_payment")}
                            className="w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold transition text-xs shadow-md"
                          >
                            {activeStrategyKey === "highest_payment" ? "Active ✓" : "Activate Highest Bill"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedPlanDetail("highest_payment")}
                            className="w-full text-center text-[10px] text-amber-400 hover:underline mt-1.5"
                          >
                            View details &rarr;
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Trajectory comparison curve */}
              {timelineData.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <div className="mb-6">
                    <p className="text-label">Payoff Trajectories</p>
                    <h3 className="font-display text-lg font-medium text-white mt-1">
                      Side-by-Side Balance Amortization
                    </h3>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineData}>
                        <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis
                          stroke="#475569"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => fmtMoney(v)}
                          width={70}
                        />
                        <Tooltip content={<GlassTooltip formatter={(v) => fmtMoney(v)} />} />
                        <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                        <Line type="monotone" dataKey="avalanche" name="Debt Avalanche" stroke="#2563EB" strokeWidth={2.5} dot={false} />
                        <Line type="monotone" dataKey="snowball" name="Debt Snowball" stroke="#10B981" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="highest_payment" name="Highest Monthly Bill" stroke="#F59E0B" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ======================================================== */}
      {/* STRATEGY DETAIL MODAL */}
      {/* ======================================================== */}
      {selectedPlanDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="glass-strong rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/15 shadow-2xl relative">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {STRATEGIES.find((s) => s.key === selectedPlanDetail)?.sublabel || "PLAN DETAILS"}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {STRATEGIES.find((s) => s.key === selectedPlanDetail)?.tagline}
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-light text-white tracking-tight">
                  {STRATEGIES.find((s) => s.key === selectedPlanDetail)?.label}
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-lg">
                  {STRATEGIES.find((s) => s.key === selectedPlanDetail)?.desc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlanDetail(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics */}
            {strategies[selectedPlanDetail] && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="glass-subtle rounded-xl p-3.5 border border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                    Debt-Free
                  </span>
                  <span className="font-display text-lg font-semibold text-blue-400 block mt-0.5 font-mono">
                    {strategies[selectedPlanDetail].payoff_date || "—"}
                  </span>
                  <span className="text-[10px] text-slate-500">Target completion</span>
                </div>
                <div className="glass-subtle rounded-xl p-3.5 border border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                    Duration
                  </span>
                  <span className="font-display text-lg font-semibold text-white block mt-0.5 font-mono">
                    {strategies[selectedPlanDetail].months} Months
                  </span>
                  <span className="text-[10px] text-slate-500">To $0 balance</span>
                </div>
                <div className="glass-subtle rounded-xl p-3.5 border border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                    Total Interest
                  </span>
                  <span className="font-display text-lg font-semibold text-amber-400 block mt-0.5 font-mono">
                    {fmtMoney(strategies[selectedPlanDetail].total_interest)}
                  </span>
                  <span className="text-[10px] text-slate-500">Finance charge</span>
                </div>
                <div className="glass-subtle rounded-xl p-3.5 border border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                    Total Paid
                  </span>
                  <span className="font-display text-lg font-semibold text-emerald-400 block mt-0.5 font-mono">
                    {fmtMoney(strategies[selectedPlanDetail].total_paid)}
                  </span>
                  <span className="text-[10px] text-emerald-400/80">Principal + Interest</span>
                </div>
              </div>
            )}

            {/* Methodology Note */}
            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 mb-6 text-xs">
              <h4 className="font-semibold text-white flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-4 h-4 text-blue-400" />
                How This Plan Works &amp; The Snowball Rollover
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                You make required minimum payments across all accounts while directing 100% of your extra payment allocation (+{fmtMoney(extra)}/mo) to your #1 priority account. When that account hits $0, its entire monthly budget automatically rolls into the next priority debt, compounding your payoff speed!
              </p>
            </div>

            {/* Step-by-Step Sequence */}
            <div className="mb-6">
              <h4 className="font-display text-sm font-semibold text-white uppercase tracking-wider mb-3">
                Debt Elimination Pipeline
              </h4>
              <div className="space-y-2 text-xs">
                {(() => {
                  let sorted = [...debts];
                  if (selectedPlanDetail === "avalanche") sorted.sort((a, b) => b.apr - a.apr);
                  else if (selectedPlanDetail === "snowball") sorted.sort((a, b) => a.balance - b.balance);
                  else if (selectedPlanDetail === "highest_payment") sorted.sort((a, b) => b.min_payment - a.min_payment);

                  return sorted.map((d, idx) => {
                    const isTarget = idx === 0;
                    return (
                      <div
                        key={d.debt_id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          isTarget
                            ? "bg-blue-600/10 border-blue-500/40 shadow-sm"
                            : "bg-white/[0.02] border-white/5 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                              isTarget ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{d.name}</span>
                              {isTarget && (
                                <span className="text-[9px] uppercase font-bold text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded">
                                  Focus Target #1
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {fmtMoney(d.balance)} balance &bull; {d.apr}% APR &bull; ${d.min_payment}/mo
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-semibold ${isTarget ? "text-blue-400" : "text-slate-300"}`}>
                            {isTarget ? "Target First" : "Pay Minimums"}
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedPlanDetail(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition"
              >
                Close
              </button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate(`/strategies/${selectedPlanDetail}`)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition"
                >
                  Full In-Depth Page &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => handleActivateStrategy(selectedPlanDetail)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition"
                >
                  <Check className="w-4 h-4" />
                  Make This My Active Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
