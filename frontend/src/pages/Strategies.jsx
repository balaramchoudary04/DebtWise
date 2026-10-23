import React, { useEffect, useState } from "react";
import { api, fmtMoney } from "../lib/api";
import { STRATEGIES } from "../lib/constants";
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
import { GlassTooltip } from "../lib/constants";
import { ArrowRight, Trophy, Zap, Target, Sparkles, HelpCircle, CheckCircle2 } from "lucide-react";

export default function Strategies() {
  const [extra, setExtra] = useState(0);
  const [compare, setCompare] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState("save_money"); // "save_money" | "motivation" | "cash_flow"
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCompare = async (val) => {
    setLoading(true);
    try {
      const { data } = await api.post("/strategies/compare", null, {
        params: { extra_payment: val },
      });
      setCompare(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompare(0);
  }, []);

  const onExtraCommit = (val) => {
    setExtra(val[0]);
    fetchCompare(val[0]);
  };

  const strategies = compare?.strategies || {};
  const visible = STRATEGIES.filter((s) => s.key !== "custom");

  // pick best (least interest)
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

  return (
    <div data-testid="strategies-page">
      <div className="mb-10">
        <p className="text-label mb-3">Plans</p>
        <h1 className="font-display text-4xl sm:text-5xl font-light tracking-tighter">
          Strategy lab.
        </h1>
        <p className="text-slate-400 mt-2 text-sm max-w-2xl">
          Same debts, four routes out. Slide the extra-payment dial to see how every dollar
          accelerates your debt-free date.
        </p>
      </div>

      {/* Help Me Choose - Goal Selector */}
      <div className="glass rounded-2xl p-6 mb-8 border-blue-500/20" data-testid="help-me-choose-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="font-display text-lg font-medium text-white">Help Me Choose: What is your primary debt goal?</h3>
          </div>
          <span className="text-xs text-slate-400">Pick a goal to see our recommended path</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setSelectedGoal("save_money")}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              selectedGoal === "save_money"
                ? "bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] ring-1 ring-blue-500"
                : "bg-white/5 border-white/5 hover:border-white/20"
            }`}
            data-testid="goal-save-money"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-display font-medium text-white text-base">💰 Pay Least Interest</span>
              {selectedGoal === "save_money" && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-400/30">
                  Active Focus
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Minimizes total money paid to lenders by attacking high APRs first.
            </p>
            <div className="mt-3 text-[11px] font-semibold text-blue-400 flex items-center gap-1">
              Recommended: <span>Save Most Money (Avalanche)</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedGoal("motivation")}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              selectedGoal === "motivation"
                ? "bg-emerald-600/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500"
                : "bg-white/5 border-white/5 hover:border-white/20"
            }`}
            data-testid="goal-motivation"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-display font-medium text-white text-base">⚡ Fast Wins & Morale</span>
              {selectedGoal === "motivation" && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Active Focus
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Eliminates small balances fast to build psychological momentum and kill open bills.
            </p>
            <div className="mt-3 text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              Recommended: <span>Fastest Motivation (Snowball)</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedGoal("cash_flow")}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              selectedGoal === "cash_flow"
                ? "bg-amber-600/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-500"
                : "bg-white/5 border-white/5 hover:border-white/20"
            }`}
            data-testid="goal-cash-flow"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-display font-medium text-white text-base">💵 Free Up Monthly Cash</span>
              {selectedGoal === "cash_flow" && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                  Active Focus
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Knocks out debts requiring your largest monthly check so you get breathing room quickly.
            </p>
            <div className="mt-3 text-[11px] font-semibold text-amber-400 flex items-center gap-1">
              Recommended: <span>Cash Flow Relief</span>
            </div>
          </button>
        </div>
      </div>

      {/* Extra payment slider */}
      <div className="glass rounded-2xl p-6 mb-8" data-testid="extra-payment-card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-label">Extra monthly payment</p>
            <p className="font-display text-3xl font-light tracking-tight mt-2">
              {fmtMoney(extra)} <span className="text-sm text-slate-500">/ month</span>
            </p>
          </div>
          {best && (
            <div className="glass-subtle rounded-lg px-3 py-2 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
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
          className="mt-2"
          data-testid="extra-payment-slider"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>$0</span>
          <span>$1,000</span>
          <span>$2,000</span>
        </div>
      </div>

      {/* Strategy cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {STRATEGIES.map((s) => {
          if (s.key === "custom") {
            return (
              <button
                key={s.key}
                onClick={() => navigate("/strategies/custom")}
                className="text-left glass rounded-2xl p-6 hover:bg-slate-800/50 hover:border-white/20 transition-all relative flex flex-col justify-between"
                data-testid={`strategy-${s.key}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }}
                      />
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {s.sublabel}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-display text-2xl font-medium tracking-tight mb-1 text-white">
                    {s.label}
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">{s.tagline}</p>
                  <p className="text-sm text-slate-300 mb-6">{s.desc}</p>
                  <div className="border-t border-white/5 pt-4 space-y-2 text-xs text-slate-400">
                    <p>Drag debts into your priority order, set per-debt extra payments, and simulate instantly.</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-400 mt-5 pt-4 border-t border-white/5">
                  Build custom plan <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          }
          const r = strategies[s.key];
          const isBest = best?.key === s.key;
          const matchesGoal =
            (selectedGoal === "save_money" && s.key === "avalanche") ||
            (selectedGoal === "motivation" && s.key === "snowball") ||
            (selectedGoal === "cash_flow" && s.key === "highest_payment");

          return (
            <button
              key={s.key}
              onClick={() => navigate(`/strategies/${s.key}`)}
              className={`text-left glass rounded-2xl p-6 hover:bg-slate-800/50 transition-all relative flex flex-col justify-between ${
                matchesGoal
                  ? "border-blue-500/70 shadow-[0_0_25px_rgba(37,99,235,0.25)] ring-1 ring-blue-500/50"
                  : isBest
                  ? "border-blue-500/40"
                  : "hover:border-white/20"
              }`}
              data-testid={`strategy-${s.key}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }}
                    />
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      {s.sublabel}
                    </span>
                  </div>
                  {matchesGoal ? (
                    <span className="text-[10px] uppercase tracking-widest text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-2 py-0.5 font-bold">
                      Your Goal Pick
                    </span>
                  ) : isBest ? (
                    <span className="text-[10px] uppercase tracking-widest text-blue-300 bg-blue-500/15 border border-blue-500/30 rounded-full px-2 py-0.5 font-bold">
                      Lowest Cost
                    </span>
                  ) : null}
                </div>
                <h3 className="font-display text-2xl font-medium tracking-tight mb-1 text-white">{s.label}</h3>
                <p className="text-xs text-slate-400 mb-3">{s.tagline}</p>
                <p className="text-sm text-slate-300 mb-6 leading-relaxed">{s.desc}</p>
                {r ? (
                  <div className="space-y-3 border-t border-white/5 pt-5">
                    <Row label="Time to freedom" value={`${r.months} months`} />
                    <Row label="Total interest" value={fmtMoney(r.total_interest)} />
                    <Row label="Total paid" value={fmtMoney(r.total_paid)} />
                    <Row label="Debt-free by" value={r.payoff_date || "—"} highlight />
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Add debts to simulate.</p>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-400 mt-5 pt-4 border-t border-white/5">
                See detailed plan <ArrowRight className="w-3 h-3" />
              </div>
            </button>
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
                  <Line type="monotone" dataKey="avalanche" name="Save Most Money (Avalanche)" stroke="#2563EB" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="snowball" name="Fastest Motivation (Snowball)" stroke="#10B981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="highest_payment" name="Cash Flow Relief" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500 text-xs uppercase tracking-widest">{label}</span>
      <span className={`font-medium ${highlight ? "text-blue-300" : "text-slate-100"}`}>
        {value}
      </span>
    </div>
  );
}
