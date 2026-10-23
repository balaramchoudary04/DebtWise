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
      <div className="mb-8">
        <p className="text-label mb-2">Plans</p>
        <h1 className="font-display text-4xl sm:text-5xl font-light tracking-tighter">
          Strategies
        </h1>
        <p className="text-slate-400 mt-2 text-sm max-w-xl">
          Pick the payoff route that fits your goals. Add extra monthly payments to see how much faster you become debt-free.
        </p>
      </div>

      {/* Goal Selector */}
      <div className="glass rounded-xl p-4 mb-6" data-testid="help-me-choose-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold">Your Main Goal</span>
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
      <div className="glass rounded-xl p-5 mb-8" data-testid="extra-payment-card">
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
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
                    <p className="text-[11px] text-slate-400">Drag to order debts or allocate extra payments freely.</p>
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
          const matchesGoal =
            (selectedGoal === "save_money" && s.key === "avalanche") ||
            (selectedGoal === "motivation" && s.key === "snowball") ||
            (selectedGoal === "cash_flow" && s.key === "highest_payment");

          return (
            <button
              key={s.key}
              onClick={() => navigate(`/strategies/${s.key}`)}
              className={`text-left glass rounded-xl p-5 hover:bg-slate-800/50 transition-all flex flex-col justify-between ${
                matchesGoal
                  ? "border-blue-500/70 shadow-[0_0_20px_rgba(37,99,235,0.2)] ring-1 ring-blue-500/40"
                  : isBest
                  ? "border-blue-500/30"
                  : "hover:border-white/20"
              }`}
              data-testid={`strategy-${s.key}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {s.sublabel}
                  </span>
                  {matchesGoal ? (
                    <span className="text-[10px] uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-2 py-0.5 font-bold">
                      Goal Match
                    </span>
                  ) : isBest ? (
                    <span className="text-[10px] uppercase tracking-wider text-blue-300 bg-blue-500/15 border border-blue-500/30 rounded-full px-2 py-0.5 font-bold">
                      Lowest Cost
                    </span>
                  ) : null}
                </div>
                <h3 className="font-display text-xl font-medium tracking-tight mb-2 text-white">{s.label}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{s.desc}</p>

                {r ? (
                  <div className="glass-subtle rounded-lg p-3 space-y-2 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider">Debt-Free</span>
                      <span className="text-sm font-semibold text-blue-300">{r.payoff_date || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider">Interest</span>
                      <span className="text-xs font-medium text-slate-200">{fmtMoney(r.total_interest)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider">Duration</span>
                      <span className="text-xs font-medium text-slate-200">{r.months} months</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Add debts to simulate.</p>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-400 mt-4 pt-3 border-t border-white/5">
                View plan details <ArrowRight className="w-3 h-3" />
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
