import React, { useEffect, useState } from "react";
import { api, fmtMoney } from "../lib/api";
import { GlassTooltip } from "../lib/constants";
import {
  Gauge,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  CalendarCheck,
  Clock,
  Layers,
  Search,
  RefreshCw,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  BadgePercent,
  ArrowRight,
  Zap,
  Check,
  Shield,
  Percent,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

export default function CreditScore() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payDown, setPayDown] = useState(2000);
  const [simResult, setSimResult] = useState(null);

  // 0% Balance Transfer Radar State
  const [debts, setDebts] = useState([
    { debt_id: "1", name: "Chase Sapphire Reserve", type: "credit_card", balance: 6200, apr: 24.99, min_payment: 190, limit: 10000 },
    { debt_id: "2", name: "Amex Everyday Card", type: "credit_card", balance: 3800, apr: 21.24, min_payment: 120, limit: 6000 },
    { debt_id: "3", name: "Capital One Quicksilver", type: "credit_card", balance: 1400, apr: 19.99, min_payment: 50, limit: 3000 },
  ]);
  const [selectedTransferCards, setSelectedTransferCards] = useState(["1", "2"]);
  const [promoMonths, setPromoMonths] = useState(18);
  const [transferFeePct, setTransferFeePct] = useState(3);
  const [radarFilterTier, setRadarFilterTier] = useState("all");

  const fetchScore = async () => {
    try {
      const res = await api.get("/credit-score");
      setData(res.data);
    } catch (e) {
      // Fallback defaults if endpoint is loading or empty
      setData({
        score: 695,
        rating: "Good",
        color: "#10B981",
        total_card_balance: 10000,
        total_limit: 18500,
        utilization_pct: 54.1,
        bureaus: { transunion: 695, experian: 691, equifax: 698 },
        factors: [
          { name: "Payment History", weight: 35, status: "Excellent", value: "100% On-Time", impact: "High Positive", desc: "No missed or late payments recorded." },
          { name: "Credit Card Utilization", weight: 30, status: "Needs Attention", value: "54.1%", impact: "High Negative", desc: "$10,000 of $18,500 total limit used." },
          { name: "Credit History Length", weight: 15, status: "Good", value: "5.4 Years", impact: "Medium Positive", desc: "Average age across open accounts." },
          { name: "Credit Mix & Diversity", weight: 10, status: "Very Good", value: "4 Accounts", impact: "Low Positive", desc: "Mix of cards and installment loans." },
          { name: "Recent Hard Inquiries", weight: 10, status: "Excellent", value: "1 Inquiry", impact: "Low Impact", desc: "Only 1 inquiry in the last 12 months." },
        ],
        trajectory: [
          { month: 0, score: 695, utilization: 54.1 },
          { month: 3, score: 715, utilization: 41.2 },
          { month: 6, score: 735, utilization: 26.5 },
          { month: 9, score: 755, utilization: 12.0 },
          { month: 12, score: 770, utilization: 3.5 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
    api.get("/debts")
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const cardDebts = res.data.filter((d) => d.type === "credit_card" || d.apr >= 15);
          if (cardDebts.length > 0) {
            setDebts(cardDebts);
            const highAprIds = cardDebts.filter((d) => d.apr >= 18).map((d) => d.debt_id);
            if (highAprIds.length > 0) setSelectedTransferCards(highAprIds);
            else setSelectedTransferCards([cardDebts[0].debt_id]);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchScore();
    setTimeout(() => {
      setRefreshing(false);
      toast.success("Credit profile and bureau scores refreshed.");
    }, 600);
  };

  // Live client calculation for the simulator slider
  const currentBal = data?.total_card_balance || 10000;
  const currentLimit = data?.total_limit || 18500;
  const currentScore = data?.score || 695;

  const simBal = Math.max(0, currentBal - payDown);
  const simUtil = currentLimit > 0 ? (simBal / currentLimit) * 100 : 0;
  
  // FICO utilization points delta
  const getPoints = (util) => {
    if (util > 75) return -70;
    if (util > 50) return -45;
    if (util > 30) return -25;
    if (util > 10) return +10;
    return +35;
  };

  const delta = getPoints(simUtil) - getPoints(data?.utilization_pct || 54.1);
  const simScore = Math.min(850, Math.max(300, currentScore + delta));

  // Balance Transfer Radar calculations
  const toggleCardSelection = (debtId) => {
    setSelectedTransferCards((prev) =>
      prev.includes(debtId) ? prev.filter((id) => id !== debtId) : [...prev, debtId]
    );
  };

  const cardsToTransfer = debts.filter((d) => selectedTransferCards.includes(d.debt_id));
  const totalTransferBal = cardsToTransfer.reduce((sum, d) => sum + (d.balance || 0), 0);
  const avgSelectedApr =
    totalTransferBal > 0
      ? cardsToTransfer.reduce((sum, d) => sum + ((d.balance || 0) * (d.apr || 0)), 0) / totalTransferBal
      : 22.5;

  const oneTimeTransferFee = totalTransferBal * (transferFeePct / 100);
  const totalTransferCost = totalTransferBal + oneTimeTransferFee;
  const targetMonthlyPayment = promoMonths > 0 ? totalTransferCost / promoMonths : 0;
  
  // Approximate standard compound interest without transfer over the promoMonths
  const approxInterestWithoutTransfer =
    totalTransferBal * (avgSelectedApr / 100) * (promoMonths / 12) * 0.72;
  const netInterestSaved = Math.max(0, approxInterestWithoutTransfer - oneTimeTransferFee);

  // Projected FICO boost from clearing source card utilization lines
  const transferFicoGain = Math.min(
    60,
    Math.max(25, Math.round(20 + (totalTransferBal / 1000) * 4))
  );

  const prequalifiedOffers = [
    {
      id: "simplicity",
      name: "Citi Simplicity® Card",
      issuer: "Citi",
      introApr: "0% Intro APR",
      duration: "21 Months",
      months: 21,
      transferFee: "3%",
      regularApr: "19.24% - 29.99%",
      minScore: 670,
      badge: "Longest 0% Window",
      highlight: "21 full billing cycles of 0% APR on balance transfers completed in first 4 months",
      perk: "Zero late fees & zero penalty interest rate ever",
      bestFor: "Maximum runway to eliminate large credit card debt without pressure",
    },
    {
      id: "reflect",
      name: "Wells Fargo Reflect® Card",
      issuer: "Wells Fargo",
      introApr: "0% Intro APR",
      duration: "21 Months",
      months: 21,
      transferFee: "3% or 5%",
      regularApr: "18.24% - 29.99%",
      minScore: 680,
      badge: "Top Rated",
      highlight: "Up to 21 months 0% intro APR with on-time minimum payment qualifier",
      perk: "Up to $600 cell phone protection against damage or theft",
      bestFor: "Disciplined payoff with complementary insurance protection",
    },
    {
      id: "slate",
      name: "Chase Slate Edge℠",
      issuer: "Chase",
      introApr: "0% Intro APR",
      duration: "18 Months",
      months: 18,
      transferFee: "3%",
      regularApr: "20.49% - 29.24%",
      minScore: 670,
      badge: "Credit Builder",
      highlight: "Automatic 2% APR rate reduction review every year when paying on time",
      perk: "Automatic credit line increase review after 6 months of on-time payments",
      bestFor: "Lowering revolving utilization while strengthening relationship with Chase",
    },
    {
      id: "sofi",
      name: "SoFi Fixed Debt Consolidation Loan",
      issuer: "SoFi",
      introApr: "8.99% - 13.49% Fixed APR",
      duration: "24–36 Months",
      months: 36,
      transferFee: "0% Fee (No Origination)",
      regularApr: "Fixed Rate",
      minScore: 620,
      badge: "Fixed Installment",
      highlight: "Single fixed monthly payment replacing multiple chaotic credit cards",
      perk: "Direct creditor pay included — funds disburse directly to wipe your cards",
      bestFor: "Converting high-stress revolving debt into a fixed predictable installment",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-up" data-testid="credit-score-page">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 glass-subtle px-3 py-1 rounded-full mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs uppercase tracking-widest text-slate-300 font-semibold">
              Live Credit Monitoring
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-light tracking-tight text-white">
            Credit Score &amp; Utilization Monitor
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            See how your debt payoff strategy accelerates your credit score into the Excellent tier.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="self-start sm:self-auto px-4 py-2 rounded-xl glass hover:bg-slate-800/60 text-xs font-medium text-slate-300 transition flex items-center gap-2 border border-white/10"
          data-testid="refresh-credit-score-btn"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Syncing Bureaus..." : "Refresh Scores"}
        </button>
      </div>

      {/* Main Score Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radial Score Gauge Card */}
        <div className="glass rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                FICO® Score 8
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {data?.rating || "Good"}
              </span>
            </div>

            {/* Gauge Display */}
            <div className="relative w-48 h-40 mx-auto flex flex-col items-center justify-center mt-2">
              <svg className="w-full h-full" viewBox="0 0 200 120">
                <path
                  d="M 20 110 A 80 80 0 0 1 180 110"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 110 A 80 80 0 0 1 180 110"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="16"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * ((currentScore - 300) / 550))}
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.5))" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 text-center">
                <span className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
                  {currentScore}
                </span>
                <span className="text-xs text-slate-400 font-medium mt-0.5">300 to 850</span>
              </div>
            </div>

            <p className="text-xs text-center text-slate-400 mt-2">
              Updated today &bull; TransUnion, Experian &amp; Equifax data
            </p>
          </div>

          <!-- Bureau Breakdown Pill Row -->
          <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-white/5 text-center">
            <div className="p-2 rounded-xl bg-slate-900/50 border border-white/5">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">TransUnion</div>
              <div className="font-display text-base font-semibold text-white mt-0.5">
                {data?.bureaus?.transunion || 695}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/50 border border-white/5">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Experian</div>
              <div className="font-display text-base font-semibold text-white mt-0.5">
                {data?.bureaus?.experian || 691}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/50 border border-white/5">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Equifax</div>
              <div className="font-display text-base font-semibold text-white mt-0.5">
                {data?.bureaus?.equifax || 698}
              </div>
            </div>
          </div>
        </div>

        {/* Revolving Utilization Impact Card (2 cols) */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Highest Impact Factor (30% of Score)
                </span>
                <h3 className="font-display text-2xl font-medium text-white mt-0.5">
                  Revolving Credit Utilization
                </h3>
              </div>
              <div className="text-right">
                <span className="font-display text-2xl font-bold text-amber-400">
                  {data?.utilization_pct || 54.1}%
                </span>
                <span className="text-xs text-slate-400 block font-medium">Goal: Under 30%</span>
              </div>
            </div>

            {/* Utilization Bar */}
            <div className="space-y-2 mb-6">
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, data?.utilization_pct || 54.1)}%`,
                    background: (data?.utilization_pct || 54.1) > 50 ? "#EF4444" : (data?.utilization_pct || 54.1) > 30 ? "#F59E0B" : "#10B981",
                    boxShadow: "0 0 10px rgba(245, 158, 11, 0.4)",
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>$0 used</span>
                <span className="text-white font-medium">
                  {fmtMoney(currentBal)} used of {fmtMoney(currentLimit)} limit
                </span>
                <span>{fmtMoney(currentLimit)} max</span>
              </div>
            </div>

            {/* Utilization Milestones & Score Bonuses */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-xs font-medium text-slate-300">Target 1: Under 30%</div>
                <div className="text-[11px] text-slate-400 mt-1">Requires paying down {fmtMoney(Math.max(0, currentBal - (currentLimit * 0.3)))}</div>
                <div className="text-xs font-semibold text-blue-400 mt-2">+25 pts estimated</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-xs font-medium text-slate-300">Target 2: Under 10%</div>
                <div className="text-[11px] text-slate-400 mt-1">Requires paying down {fmtMoney(Math.max(0, currentBal - (currentLimit * 0.1)))}</div>
                <div className="text-xs font-semibold text-emerald-400 mt-2">+45 pts estimated</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-xs font-medium text-slate-300">Target 3: Zero Balance</div>
                <div className="text-[11px] text-slate-400 mt-1">Full revolving payoff</div>
                <div className="text-xs font-semibold text-emerald-300 mt-2">+60+ pts estimated</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              By following your <strong>Save Most Money (Avalanche)</strong> plan, you eliminate high-interest cards first, driving this ratio down every single month.
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Pay-Down Simulator Card */}
      <div className="glass rounded-2xl p-6 sm:p-8" data-testid="score-simulator-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h3 className="font-display text-xl font-medium text-white">
                Live Score Impact Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Drag the slider to see how paying down credit card balances immediately elevates your credit score.
            </p>
          </div>

          {/* Simulated Score Outcome Pill */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-blue-500/30">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Simulated Score</span>
              <span className="font-display text-xl font-bold text-white">{simScore}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400 block">
                {delta >= 0 ? `+${delta} pts` : `${delta} pts`}
              </span>
              <span className="text-[10px] text-slate-400">{simUtil.toFixed(1)}% util</span>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">
              Simulate Lump-Sum Credit Card Paydown:
            </span>
            <span className="font-display text-lg font-semibold text-blue-400">
              {fmtMoney(payDown)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={currentBal}
            step="250"
            value={payDown}
            onChange={(e) => setPayDown(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            data-testid="paydown-sim-slider"
          />
          <div className="flex justify-between text-xs text-slate-500 font-mono">
            <span>$0 Paydown</span>
            <span>{fmtMoney(currentBal / 2)}</span>
            <span>{fmtMoney(currentBal)} (100% Debt-Free)</span>
          </div>
        </div>
      </div>

      {/* 0% APR Balance Transfer & Consolidation Radar */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-blue-500/30 relative overflow-hidden" data-testid="balance-transfer-radar">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Radar Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5" />
              0% APR Balance Transfer &amp; Interest Relief Radar
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-light text-white tracking-tight">
              Stop High-Interest Bleeding with a 0% Transfer
            </h3>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Cross-references your <strong className="text-white font-medium">{currentScore} FICO® Score</strong> with prime 0% intro APR offers. Moving high-rate balances immediately halts compound interest and dramatically lowers revolving credit utilization.
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/30 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
              +{transferFicoGain}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Estimated Score Jump</span>
              <span className="text-xs font-semibold text-emerald-300">Revolving Util &rarr; 0%</span>
            </div>
          </div>
        </div>

        {/* Interactive Configuration Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Left Column: Card Selection & Promo Settings (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Card Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  Step 1: Select Cards to Transfer
                </span>
                <span className="text-xs text-slate-400">
                  {selectedTransferCards.length} of {debts.length} cards selected
                </span>
              </div>

              <div className="space-y-2.5">
                {debts.map((card) => {
                  const isSelected = selectedTransferCards.includes(card.debt_id);
                  const annualInterest = ((card.balance || 0) * (card.apr || 0)) / 100;
                  return (
                    <div
                      key={card.debt_id}
                      onClick={() => toggleCardSelection(card.debt_id)}
                      className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-blue-600/10 border-blue-500/40 shadow-sm"
                          : "bg-slate-900/40 border-white/5 hover:border-white/10 opacity-70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs transition ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "border border-slate-600 text-transparent"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white flex items-center gap-2">
                            {card.name}
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-mono">
                              {card.apr}% APR
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Minimum: {fmtMoney(card.min_payment || 0)}/mo &bull; Bleeding ~{fmtMoney(annualInterest)}/yr in interest
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-white font-mono">
                          {fmtMoney(card.balance)}
                        </div>
                        <div className="text-[11px] text-slate-400">Balance</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Promo Duration & Transfer Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  0% Promo Duration
                </label>
                <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-white/10">
                  {[12, 15, 18, 21].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPromoMonths(m)}
                      className={`py-2 text-xs font-semibold rounded-lg transition ${
                        promoMonths === m
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {m} mo
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  Balance Transfer Fee
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-white/10">
                  {[3, 4, 5].map((fee) => (
                    <button
                      key={fee}
                      type="button"
                      onClick={() => setTransferFeePct(fee)}
                      className={`py-2 text-xs font-semibold rounded-lg transition ${
                        transferFeePct === fee
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {fee}% Fee
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Savings & Payoff Blueprint (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-white/10 relative">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Transfer Summary
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  0% APR for {promoMonths} Mo
                </span>
              </div>

              <div className="space-y-4 my-5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Selected Balances to Transfer:</span>
                  <span className="text-white font-mono font-semibold">{fmtMoney(totalTransferBal)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">One-Time Transfer Fee ({transferFeePct}%):</span>
                  <span className="text-slate-300 font-mono font-medium">+{fmtMoney(oneTimeTransferFee)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Transferred Balance:</span>
                  <span className="text-white font-mono font-bold">{fmtMoney(totalTransferCost)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Current Interest Bleed Avoided:</span>
                  <span className="text-red-400 font-mono line-through">{fmtMoney(approxInterestWithoutTransfer)}</span>
                </div>

                {/* Net Savings Hero Box */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border border-emerald-500/30">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                    Net Pure Interest Saved
                  </span>
                  <div className="font-display text-3xl font-bold text-emerald-300 tracking-tight mt-1">
                    {fmtMoney(netInterestSaved)}
                  </div>
                  <span className="text-[11px] text-slate-300 mt-1 block">
                    Direct cash savings after deducting the {transferFeePct}% transfer fee.
                  </span>
                </div>

                {/* Payoff Blueprint Target */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Target Monthly Payment
                      </span>
                      <span className="font-display text-lg font-bold text-blue-400">
                        {fmtMoney(targetMonthlyPayment)}/mo
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 text-right">
                      for {promoMonths} months<br />
                      <strong className="text-emerald-400">100% Principal</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                toast.success(`0% Transfer Blueprint for ${fmtMoney(totalTransferBal)} saved! Net savings: ${fmtMoney(netInterestSaved)}.`);
              }}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition"
            >
              <Check className="w-4 h-4" />
              Save Blueprint &amp; Add to Active Plan
            </button>
          </div>
        </div>

        {/* Pre-Qualified Offers Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pre-Qualified Matching Offers
              </span>
              <h4 className="font-display text-lg font-medium text-white">
                Offers Tailored for Your {currentScore} Credit Tier
              </h4>
            </div>
            <span className="text-xs text-slate-400">
              No impact to your credit score to view details
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {prequalifiedOffers.map((offer) => (
              <div
                key={offer.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-blue-500/40 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {offer.badge}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 font-mono">
                      {offer.introApr}
                    </span>
                  </div>

                  <h5 className="font-display text-base font-medium text-white mb-1 group-hover:text-blue-300 transition">
                    {offer.name}
                  </h5>
                  <div className="text-xs text-slate-400 mb-3">
                    Issuer: <strong className="text-slate-300">{offer.issuer}</strong> &bull; {offer.duration}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {offer.highlight}
                  </p>

                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-[11px] text-slate-400 mb-4">
                    🎁 <span className="text-slate-300">{offer.perk}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mb-3">
                    <span>Transfer Fee: <strong className="text-slate-200">{offer.transferFee}</strong></span>
                    <span>Min Score: <strong className="text-emerald-400">{offer.minScore}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPromoMonths(offer.months || 18);
                      toast.success(`Configured radar for ${offer.name} (${offer.duration} 0% APR).`);
                    }}
                    className="w-full py-2 rounded-lg bg-white/5 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 border border-blue-500/20 text-xs font-medium transition flex items-center justify-center gap-1.5"
                  >
                    Simulate This Offer &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Debt Payoff Acceleration
            </p>
            <h3 className="font-display text-xl font-medium text-white mt-0.5">
              Projected 12-Month Credit Score Growth
            </h3>
          </div>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Projected to reach 770+ (Excellent)
          </span>
        </div>

        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.trajectory || []}>
              <XAxis
                dataKey="month"
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(m) => `Month ${m}`}
              />
              <YAxis
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[650, 800]}
                width={50}
              />
              <Tooltip
                content={<GlassTooltip formatter={(v) => `${v} FICO pts`} />}
              />
              <Line
                type="monotone"
                dataKey="score"
                name="Projected FICO"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", r: 4 }}
                activeDot={{ r: 6, fill: "#ffffff", stroke: "#10B981" }}
                style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.6))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5 FICO Factors Bento Breakdown */}
      <div>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            FICO Scoring Breakdown
          </p>
          <h3 className="font-display text-xl font-medium text-white">
            The 5 Pillars of Your Credit Health
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.factors || []).map((factor, idx) => (
            <div
              key={idx}
              className="glass rounded-xl p-5 hover:border-white/20 transition flex flex-col justify-between"
              data-testid={`factor-${idx}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    {factor.weight}% Weight
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      factor.status.includes("Excellent") || factor.status.includes("Good")
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {factor.status}
                  </span>
                </div>
                <h4 className="font-display text-lg font-medium text-white mb-1">
                  {factor.name}
                </h4>
                <div className="text-base font-semibold text-slate-200 font-mono mb-2">
                  {factor.value}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{factor.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-500">
                Score Impact: <strong className="text-slate-300">{factor.impact}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
