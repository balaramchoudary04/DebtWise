import React, { useState, useEffect } from "react";
import { api, fmtMoney } from "../lib/api";
import { debtTypeMeta } from "../lib/constants";
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Copy,
  Printer,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export default function MonthlyPaymentInstructions({ debts = [], strategy = "avalanche", extra = 200 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInstructions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/strategies/monthly-instructions?strategy=${strategy}&extra_payment=${extra}`);
      setData(res.data);
    } catch (e) {
      // Local fallback
      const active = [...debts].sort((a, b) => b.apr - a.apr);
      const target = active[0];
      const instrs = debts.map((d) => {
        const isTarget = target && d.debt_id === target.debt_id;
        return {
          debt_id: d.debt_id,
          name: d.name,
          type: d.type,
          balance: d.balance,
          apr: d.apr,
          min_payment: d.min_payment,
          extra_allocated: isTarget ? extra : 0,
          total_recommended: d.min_payment + (isTarget ? extra : 0),
          due_day: d.due_day || 15,
          is_priority_target: isTarget,
          reason: isTarget ? `Highest APR (${d.apr}%) — targets most expensive interest first.` : `Standard minimum payment required while targeting ${target?.name || "priority"}.`,
          is_paid: false,
          auto_detected: false,
        };
      });
      const totalMins = debts.reduce((s, d) => s + d.min_payment, 0);
      setData({
        month: "Current Month",
        strategy,
        strategy_label: "Save Most Money",
        total_minimums: totalMins,
        extra_payment: extra,
        total_budget: totalMins + extra,
        paid_so_far: 0,
        remaining_to_pay: totalMins + extra,
        instructions: instrs,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategy, extra, debts]);

  const copyPaydayPlan = () => {
    if (!data || !data.instructions) return;
    let text = `DEBTWISE PAYDAY BLUEPRINT — ${data.month}\n`;
    text += `Strategy: ${data.strategy_label} (Extra: ${fmtMoney(data.extra_payment)}/mo)\n`;
    text += `Total Monthly Budget: ${fmtMoney(data.total_budget)}\n\n`;
    data.instructions.forEach((inst, i) => {
      text += `${i + 1}. ${inst.name} (Due day ${inst.due_day}):\n`;
      text += `   Pay: ${fmtMoney(inst.total_recommended)}`;
      if (inst.is_priority_target) text += ` (Min ${fmtMoney(inst.min_payment)} + ${fmtMoney(inst.extra_allocated)} extra ⭐)`;
      text += `\n`;
    });
    navigator.clipboard.writeText(text);
    toast.success("Copied payday instructions to clipboard!");
  };

  if (!data || !data.instructions || data.instructions.length === 0) {
    return null;
  }

  const priorityTarget = data.instructions.find((i) => i.is_priority_target);

  return (
    <div className="glass rounded-2xl p-6 mb-10" data-testid="monthly-payment-instructions">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
            <p className="text-label">Payday Blueprint</p>
          </div>
          <h3 className="font-display text-2xl font-light tracking-tight mt-1 text-white">
            Exact Monthly Payment Instructions
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Zero guesswork on paydays. Here is exactly what to pay to each account this month.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyPaydayPlan}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition flex items-center gap-1.5"
            title="Copy plan to clipboard"
          >
            <Copy className="w-3.5 h-3.5" /> Copy Plan
          </button>
        </div>
      </div>

      {/* Priority Target Callout Banner */}
      {priorityTarget && (
        <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-500/30 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-400/30">
                  Priority Focus Target
                </span>
                <span className="text-xs text-slate-400">Due Day {priorityTarget.due_day}</span>
              </div>
              <h4 className="font-display text-lg font-medium text-white">{priorityTarget.name}</h4>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">{priorityTarget.reason}</p>
            </div>
          </div>

          <div className="text-right shrink-0 bg-slate-900/60 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Total to Pay This Month</span>
            <div className="font-display text-2xl font-bold text-emerald-400">
              {fmtMoney(priorityTarget.total_recommended)}
            </div>
            <span className="text-[11px] text-slate-400">
              Min {fmtMoney(priorityTarget.min_payment)} + <strong className="text-blue-300 font-mono">+{fmtMoney(priorityTarget.extra_allocated)} extra</strong>
            </span>
          </div>
        </div>
      )}

      {/* Total Budget Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-6 text-xs">
        <div>
          <span className="text-slate-400 font-medium">Monthly Minimums Required:</span>
          <div className="font-mono text-base font-semibold text-white mt-0.5">{fmtMoney(data.total_minimums)}</div>
        </div>
        <div>
          <span className="text-slate-400 font-medium">Extra Strategy Acceleration:</span>
          <div className="font-mono text-base font-semibold text-blue-400 mt-0.5">+{fmtMoney(data.extra_payment)}</div>
        </div>
        <div>
          <span className="text-slate-400 font-medium">Total Payday Allocation Needed:</span>
          <div className="font-mono text-base font-bold text-emerald-400 mt-0.5">{fmtMoney(data.total_budget)}</div>
        </div>
      </div>

      {/* Breakdown per Account */}
      <div className="space-y-2.5">
        {data.instructions.map((inst, index) => {
          const typeMeta = debtTypeMeta(inst.type);
          return (
            <div
              key={inst.debt_id}
              className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                inst.is_priority_target
                  ? "bg-blue-950/20 border-blue-500/40 shadow-sm"
                  : "bg-white/[0.02] border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-slate-300 shrink-0">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: typeMeta.color }} />
                    <h5 className="font-medium text-sm text-white truncate">{inst.name}</h5>
                    {inst.is_priority_target && (
                      <span className="text-[9px] uppercase tracking-wider font-bold text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded">
                        Target
                      </span>
                    )}
                    {inst.auto_detected && (
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5" /> Auto-Detected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>Due Day {inst.due_day}</span>
                    <span>•</span>
                    <span>APR {inst.apr}%</span>
                    <span>•</span>
                    <span className="text-slate-300">{inst.reason}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 sm:text-right">
                <div>
                  <div className="text-base font-bold font-mono text-white">
                    {fmtMoney(inst.total_recommended)}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    {inst.is_priority_target ? `Min ${fmtMoney(inst.min_payment)} + ${fmtMoney(inst.extra_allocated)} extra` : `Minimum only`}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                  {inst.is_paid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-600" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
