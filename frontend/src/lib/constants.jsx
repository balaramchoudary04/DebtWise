import React from "react";

export const DEBT_TYPES = [
  { value: "credit_card", label: "Credit Card", color: "#EF4444" },
  { value: "personal_loan", label: "Personal Loan", color: "#F59E0B" },
  { value: "car_loan", label: "Car Loan", color: "#10B981" },
  { value: "student_loan", label: "Student Loan", color: "#2563EB" },
  { value: "mortgage", label: "Mortgage", color: "#8B5CF6" },
  { value: "medical", label: "Medical", color: "#EC4899" },
  { value: "other", label: "Other", color: "#64748B" },
];

export const STRATEGIES = [
  {
    key: "avalanche",
    label: "Save Most Money",
    sublabel: "Debt Avalanche Method",
    tagline: "Highest interest rate (APR) first",
    badge: "Lowest Total Cost",
    desc: "Targets your most expensive interest rate first. Mathematically proven to save you the most money in total interest.",
    color: "#2563EB",
  },
  {
    key: "snowball",
    label: "Fastest Motivation",
    sublabel: "Debt Snowball Method",
    tagline: "Smallest balance first",
    badge: "Quickest Wins",
    desc: "Clears small balances first to give you fast psychological momentum, eliminate individual accounts, and reduce bill stress.",
    color: "#10B981",
  },
  {
    key: "highest_payment",
    label: "Cash Flow Relief",
    sublabel: "Highest Minimum Payment First",
    tagline: "Largest monthly payment first",
    badge: "Breathe Sooner",
    desc: "Knocks out the debt taking the biggest bite out of your monthly paycheck, freeing up monthly cash flow fastest.",
    color: "#F59E0B",
  },
  {
    key: "custom",
    label: "Custom Order",
    sublabel: "Your Priority Order",
    tagline: "Drag & drop your order",
    badge: "Total Control",
    desc: "Define the payoff sequence yourself or allocate custom extra payments to specific debts.",
    color: "#EC4899",
  },
];

export function debtTypeMeta(type) {
  return DEBT_TYPES.find((t) => t.value === type) || DEBT_TYPES[DEBT_TYPES.length - 1];
}

export function GlassTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs">
      {label != null && <div className="text-slate-400 mb-1">Month {label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-white font-medium">
            {formatter ? formatter(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}
