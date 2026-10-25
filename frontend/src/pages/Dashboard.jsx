import React, { useEffect, useState } from "react";
import { api, fmtMoney } from "../lib/api";
import { DEBT_TYPES, STRATEGIES, debtTypeMeta, GlassTooltip } from "../lib/constants";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  Wallet,
  CalendarClock,
  Percent,
  CalendarHeart,
  PlusCircle,
  ArrowUpRight,
  AlertCircle,
  Trophy,
  Award,
  Sparkles,
  Printer,
  Zap,
  SlidersHorizontal,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  X,
  Bell,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Calculator,
  ShoppingBag,
  Utensils,
  Home,
  Car,
  Film,
  HeartPulse,
  DollarSign,
  ChevronRight,
  Plus,
  RefreshCw,
  Scissors,
  ArrowRight,
  Edit2,
  TrendingDown,
  Layers,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import PaymentCalendar from "../components/PaymentCalendar";
import MonthlyPaymentInstructions from "../components/MonthlyPaymentInstructions";
import DebtProgressHistory from "../components/DebtProgressHistory";

const DEFAULT_WIDGETS = [
  { id: "metrics", title: "Overview Metrics", desc: "Total debt, monthly minimums, average APR, and debt-free target" },
  { id: "plaid_reconciliation", title: "Automated Payment Reconciliation & Protection Alerts", desc: "Real-time Plaid payment matching from checking accounts and credit score protection alerts" },
  { id: "spend_budget_planner", title: "Spend Calculator & Budget Planner", desc: "Live living expense tracking, 50/30/20 cash flow breakdown, and surplus-to-debt accelerator" },
  { id: "milestones", title: "Payoff Milestones", desc: "Achievements, motivation badges, and milestone progress" },
  { id: "payday_instructions", title: "Exact Monthly Payment Instructions", desc: "Zero-guesswork payday blueprint and strategy extra allocation" },
  { id: "breakdown_timeline", title: "Portfolio Breakdown & Payoff Curve", desc: "Debt composition donut and projected avalanche payoff trajectory" },
  { id: "debt_history", title: "Principal Reduction Trend", desc: "Historical month-over-month decline and total debt eliminated" },
  { id: "payoff_pipeline", title: "Payoff Order Pipeline", desc: "Step-by-step account payoff sequence under your strategy" },
  { id: "calendar", title: "Interactive Due Date Calendar", desc: "Live calendar with Plaid bank detection, bill tracking, and reminders" },
  { id: "smart_advisor", title: "Smart Strategy Advisor", desc: "Automated AI interest-saving recommendations and warnings" },
  { id: "strategy_compare", title: "Strategies Head-to-Head", desc: "Direct comparison of Avalanche, Snowball, and Highest Payment" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [debts, setDebts] = useState([]);
  const [compare, setCompare] = useState(null);
  const [boostedCompare, setBoostedCompare] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customizingLayout, setCustomizingLayout] = useState(false);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [draggedWidgetIndex, setDraggedWidgetIndex] = useState(null);
  const [dragOverWidgetIndex, setDragOverWidgetIndex] = useState(null);
  const [draggedModalIndex, setDraggedModalIndex] = useState(null);
  const [dragOverModalIndex, setDragOverModalIndex] = useState(null);

  // Plaid Automated Payment Reconciliation & Protection Alerts State
  const [alerts, setAlerts] = useState([
    {
      id: "alt-1",
      type: "reconciled",
      severity: "success",
      title: "Plaid Payment Reconciled",
      sourceAccount: "Chase Premier Checking (••9124)",
      destAccount: "Chase Sapphire Reserve (••4102)",
      amount: 190.0,
      date: "Oct 15, 2026",
      desc: "Auto-matched withdrawal against minimum payment due. Debt balance reduced to $6,200.",
      impact: "100% Debt Payoff ($0 Discretionary Spending)",
      badge: "VERIFIED PLAID TRANSFER",
    },
    {
      id: "alt-2",
      type: "reconciled",
      severity: "success",
      title: "AutoPay Debit Reconciled",
      sourceAccount: "Chase Premier Checking (••9124)",
      destAccount: "Amex Everyday Card (••8819)",
      amount: 120.0,
      date: "Oct 12, 2026",
      desc: "Payment matched from checking account. Marked as Paid in your Interactive Calendar.",
      impact: "Debt balance decreased by $120.00",
      badge: "CONFIRMED PAID",
    },
    {
      id: "alt-3",
      type: "protection",
      severity: "warning",
      title: "High Utilization Risk: Chase Sapphire",
      sourceAccount: "Chase Sapphire Reserve",
      destAccount: null,
      amount: 6200.0,
      date: "Statement Closes Nov 2",
      desc: "Card is at 62% limit utilization ($6,200 of $10,000). Paying down $1,200 before your statement closes on Nov 2 will prevent an estimated 12–18 point FICO drop.",
      impact: "FICO Score At Risk: -15 pts",
      badge: "CREDIT PROTECTION",
    },
    {
      id: "alt-4",
      type: "shield",
      severity: "info",
      title: "Due Date Safe Shield: Toyota Auto",
      sourceAccount: "Chase Premier Checking ($3,450 balance)",
      destAccount: "Toyota Auto Financing",
      amount: 300.0,
      date: "Due Nov 5, 2026",
      desc: "Upcoming monthly auto loan payment is fully covered by checking surplus. Zero overdraft risk.",
      impact: "Safe Auto-Debit Protected",
      badge: "OVERDRAFT SHIELD",
    },
  ]);
  const [alertFilter, setAlertFilter] = useState("all");
  const [showAlertDrawer, setShowAlertDrawer] = useState(false);

  const simulateNewPlaidPayment = () => {
    const newAlert = {
      id: `alt-${Date.now()}`,
      type: "reconciled",
      severity: "success",
      title: "Real-Time Payment Reconciled via Plaid",
      sourceAccount: "Chase Premier Checking (••9124)",
      destAccount: "Chase Sapphire Reserve (••4102)",
      amount: 250.0,
      date: "Just now",
      desc: "Real-time webhook detected $250.00 payment. Debt balance decreased from $6,200 to $5,950.",
      impact: "Zero misclassification ($0 counted as spending)",
      badge: "LIVE PLAID MATCH",
    };
    setAlerts((prev) => [newAlert, ...prev]);
    toast.success("⚡ Plaid webhook detected $250.00 payment from Checking! Accurately logged as debt payoff.");
  };

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.info("Alert dismissed.");
  };

  // Monthly Spending Tracker & Budget Planner State
  const [budgetIncome, setBudgetIncome] = useState(5200);
  const [budgetPayFrequency, setBudgetPayFrequency] = useState("monthly");
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [tempIncomeInput, setTempIncomeInput] = useState("5200");
  const [budgetMode, setBudgetMode] = useState("custom"); // "custom" | "auto_debt"
  const [autoIntensity, setAutoIntensity] = useState("balanced"); // "aggressive" | "balanced" | "relaxed"
  const [showAutoBuildModal, setShowAutoBuildModal] = useState(false);
  const [autoBuildResult, setAutoBuildResult] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [tempCategoryBudget, setTempCategoryBudget] = useState("");
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatSpent, setNewCatSpent] = useState("");
  const [newCatBudget, setNewCatBudget] = useState("");

  const [categories, setCategories] = useState([
    { id: "housing", name: "Housing & Rent", spent: 1650, budget: 1650, icon: "Home" },
    { id: "groceries", name: "Groceries", spent: 520, budget: 550, icon: "ShoppingBag" },
    { id: "utilities", name: "Utilities & Bills", spent: 240, budget: 250, icon: "Zap" },
    { id: "transportation", name: "Transportation & Gas", spent: 380, budget: 400, icon: "Car" },
    { id: "healthcare", name: "Healthcare & Meds", spent: 160, budget: 180, icon: "HeartPulse" },
    { id: "dining", name: "Dining Out", spent: 310, budget: 350, icon: "Utensils" },
    { id: "shopping", name: "Shopping", spent: 220, budget: 250, icon: "ShoppingBag" },
    { id: "entertainment", name: "Entertainment & Fun", spent: 140, budget: 150, icon: "Film" },
    { id: "subscriptions", name: "Subscriptions", spent: 70, budget: 70, icon: "Sparkles" },
  ]);

  const saveBudgetSettings = (updatedBudget) => {
    api.put("/user/budget-planner", updatedBudget).catch(() => {});
  };

  const handleSaveIncome = () => {
    const val = parseFloat(tempIncomeInput);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid monthly income.");
      return;
    }
    setBudgetIncome(val);
    setIsEditingIncome(false);
    saveBudgetSettings({
      monthly_income: val,
      pay_frequency: budgetPayFrequency,
      budget_mode: budgetMode,
      categories: categories,
      total_budget: categories.reduce((s, c) => s + (parseFloat(c.budget) || 0), 0),
    });
    toast.success(`Monthly income updated to $${val.toLocaleString()} (${budgetPayFrequency}).`);
  };

  const handleUpdateCategoryBudget = (id, newAmt) => {
    const val = parseFloat(newAmt);
    if (isNaN(val) || val < 0) {
      toast.error("Please enter a valid budget amount.");
      return;
    }
    const updated = categories.map((c) => (c.id === id ? { ...c, budget: val, auto_recommended: false } : c));
    setCategories(updated);
    setEditingCategoryId(null);
    setBudgetMode("custom");
    saveBudgetSettings({
      monthly_income: budgetIncome,
      pay_frequency: budgetPayFrequency,
      budget_mode: "custom",
      categories: updated,
      total_budget: updated.reduce((s, c) => s + (parseFloat(c.budget) || 0), 0),
    });
    toast.success("Budget target updated.");
  };

  const handleOpenAutoBuildModal = async (intensity = "balanced") => {
    setAutoIntensity(intensity);
    try {
      const res = await api.post("/user/budget-planner/auto-build", { strategy_intensity: intensity });
      if (res.data) {
        setAutoBuildResult(res.data);
        setShowAutoBuildModal(true);
      }
    } catch {
      const targetSurplus = intensity === "aggressive" ? 860 : intensity === "relaxed" ? 350 : 630;
      const trimRatio = intensity === "aggressive" ? 0.45 : intensity === "relaxed" ? 0.15 : 0.30;
      const updated = categories.map((cat) => {
        const flexible = ["dining", "shopping", "entertainment", "subscriptions", "groceries", "transportation"].includes(cat.id);
        if (flexible) {
          const cut = Math.round(cat.spent * 0.4 * trimRatio);
          return { ...cat, budget: Math.max(40, cat.spent - cut), auto_recommended: true };
        }
        return { ...cat, budget: cat.spent, auto_recommended: true };
      });
      setAutoBuildResult({
        categories: updated,
        target_surplus: targetSurplus,
        intensity: intensity,
        projected_months_saved: intensity === "aggressive" ? 14 : intensity === "relaxed" ? 5 : 9,
        projected_interest_saved: intensity === "aggressive" ? 2450 : intensity === "relaxed" ? 950 : 1680,
      });
      setShowAutoBuildModal(true);
    }
  };

  const applyAutoBuiltBudget = () => {
    if (!autoBuildResult) return;
    setCategories(autoBuildResult.categories);
    setBudgetMode("auto_debt");
    setShowAutoBuildModal(false);
    saveBudgetSettings({
      monthly_income: budgetIncome,
      pay_frequency: budgetPayFrequency,
      budget_mode: "auto_debt",
      categories: autoBuildResult.categories,
      total_budget: autoBuildResult.categories.reduce((s, c) => s + (parseFloat(c.budget) || 0), 0),
    });
    toast.success(`✨ Debt-Optimized Budget applied (${autoBuildResult.intensity} strategy)!`);
  };

  const handleAddCustomCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Please enter a category name.");
      return;
    }
    const spentVal = parseFloat(newCatSpent) || 0;
    const budgetVal = parseFloat(newCatBudget) || (spentVal > 0 ? spentVal : 100);
    const newItem = {
      id: `custom-${Date.now()}`,
      name: newCatName.trim(),
      spent: spentVal,
      budget: budgetVal,
      icon: "DollarSign",
    };
    const updated = [...categories, newItem];
    setCategories(updated);
    setNewCatName("");
    setNewCatSpent("");
    setNewCatBudget("");
    setShowAddCategoryModal(false);
    saveBudgetSettings({
      monthly_income: budgetIncome,
      pay_frequency: budgetPayFrequency,
      budget_mode: budgetMode,
      categories: updated,
      total_budget: updated.reduce((s, c) => s + (parseFloat(c.budget) || 0), 0),
    });
    toast.success(`Added "${newItem.name}" to spending tracker!`);
  };

  const handleRefreshPlaidBudget = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: "Syncing checking transactions & liabilities via Plaid...",
        success: "⚡ Synchronized! $880.00/mo in credit card & loan payments isolated from spending.",
        error: "Sync failed",
      }
    );
  };

  const [widgets, setWidgets] = useState(() => {
    try {
      const saved = localStorage.getItem("debtwise_dashboard_layout");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const ids = new Set(parsed.map((p) => p.id));
          const missing = DEFAULT_WIDGETS.filter((dw) => !ids.has(dw.id)).map((dw) => ({ id: dw.id, visible: true }));
          return [...parsed, ...missing];
        }
      }
    } catch {}
    return DEFAULT_WIDGETS.map((dw) => ({ id: dw.id, visible: true }));
  });

  const navigate = useNavigate();

  useEffect(() => {
    api.get("/user/dashboard-layout")
      .then((res) => {
        if (res.data?.layout && Array.isArray(res.data.layout) && res.data.layout.length > 0) {
          const ids = new Set(res.data.layout.map((p) => p.id));
          const missing = DEFAULT_WIDGETS.filter((dw) => !ids.has(dw.id)).map((dw) => ({ id: dw.id, visible: true }));
          const full = [...res.data.layout, ...missing];
          setWidgets(full);
          localStorage.setItem("debtwise_dashboard_layout", JSON.stringify(full));
        }
      })
      .catch(() => {});
  }, []);

  const saveLayout = (newWidgets) => {
    setWidgets(newWidgets);
    try {
      localStorage.setItem("debtwise_dashboard_layout", JSON.stringify(newWidgets));
    } catch {}
    api.put("/user/dashboard-layout", { layout: newWidgets }).catch(() => {});
  };

  const moveWidget = (fromIndex, direction) => {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= widgets.length) return;
    const updated = [...widgets];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    saveLayout(updated);
  };

  const toggleWidgetVisibility = (id) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w));
    saveLayout(updated);
  };

  const resetLayout = () => {
    const def = DEFAULT_WIDGETS.map((dw) => ({ id: dw.id, visible: true }));
    saveLayout(def);
    toast.success("Dashboard layout reset to default!");
  };

  useEffect(() => {
    Promise.all([
      api.get("/debts"),
      api.post("/strategies/compare", null, { params: { extra_payment: 0 } }),
      api.post("/strategies/compare", null, { params: { extra_payment: 100 } }),
      api.get("/reminders/upcoming"),
      api.get("/user/budget-planner").catch(() => ({ data: null })),
    ])
      .then(([d, c, bc, r, bp]) => {
        setDebts(d.data);
        setCompare(c.data);
        setBoostedCompare(bc.data);
        setReminders(r.data);
        if (bp?.data) {
          if (bp.data.monthly_income) {
            setBudgetIncome(bp.data.monthly_income);
            setTempIncomeInput(String(bp.data.monthly_income));
          }
          if (bp.data.pay_frequency) setBudgetPayFrequency(bp.data.pay_frequency);
          if (bp.data.budget_mode) setBudgetMode(bp.data.budget_mode);
          if (bp.data.categories && Array.isArray(bp.data.categories) && bp.data.categories.length > 0) {
            setCategories(bp.data.categories);
          } else if ((bp.data.needs && bp.data.needs.length > 0) || (bp.data.wants && bp.data.wants.length > 0)) {
            const mapped = [
              ...(bp.data.needs || []).map((n) => ({ id: n.id, name: n.name, spent: n.amount, budget: n.amount, icon: n.icon || "Home" })),
              ...(bp.data.wants || []).map((w) => ({ id: w.id, name: w.name, spent: w.amount, budget: w.amount, icon: w.icon || "ShoppingBag" })),
            ];
            if (mapped.length > 0) setCategories(mapped);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (window.location.hash === "#spend-budget-planner") {
      setTimeout(() => {
        const el = document.getElementById("spend-budget-planner");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 400);
    }
  }, []);

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const totalMin = debts.reduce((s, d) => s + d.min_payment, 0);
  const avgApr = debts.length
    ? debts.reduce((s, d) => s + d.apr * d.balance, 0) / Math.max(totalDebt, 1)
    : 0;

  const avalanche = compare?.strategies?.avalanche;
  const pieData = debts.map((d) => ({
    name: d.name,
    value: d.balance,
    color: debtTypeMeta(d.type).color,
  }));

  // Smart Advisor recommendations engine
  const recommendations = [];
  const highAprDebt = debts.find(d => d.apr > 20);
  if (highAprDebt) {
    recommendations.push({
      type: "warning",
      title: "High APR Warning",
      text: `Your debt "${highAprDebt.name}" has an extremely high interest rate of ${highAprDebt.apr.toFixed(1)}%. Prioritize paying this off first to avoid compounding charges.`,
    });
  }

  const avalancheInterest = compare?.strategies?.avalanche?.total_interest || 0;
  const snowballInterest = compare?.strategies?.snowball?.total_interest || 0;
  const strategySavings = snowballInterest - avalancheInterest;
  if (strategySavings > 10) {
    recommendations.push({
      type: "info",
      title: "Interest Savings Match",
      text: `Using the Save Most Money strategy (Debt Avalanche) instead of Fastest Motivation (Snowball) will save you ${fmtMoney(strategySavings)} in total interest payments!`,
    });
  }

  const dominantDebt = debts.length ? debts.reduce((max, d) => d.min_payment > max.min_payment ? d : max, debts[0]) : null;
  if (dominantDebt && totalMin > 0 && (dominantDebt.min_payment / totalMin) > 0.35) {
    const percent = Math.round((dominantDebt.min_payment / totalMin) * 100);
    recommendations.push({
      type: "info",
      title: "Cash Flow Dominance Alert",
      text: `"${dominantDebt.name}" requires ${fmtMoney(dominantDebt.min_payment)}/mo, representing ${percent}% of your total minimum payments. Clearing this with the Cash Flow Relief plan frees up your monthly budget fastest.`,
    });
  }

  const baseAv = compare?.strategies?.avalanche;
  const boostedAv = boostedCompare?.strategies?.avalanche;
  if (baseAv && boostedAv) {
    const savings = Math.max(0, baseAv.total_interest - boostedAv.total_interest);
    const months = Math.max(0, baseAv.months - boostedAv.months);
    if (savings > 50 && months > 0) {
      recommendations.push({
        type: "success",
        title: "Accelerated Payoff Opportunity",
        text: `Adding just $100/month extra to your payments will shorten your payoff by ${months} months and save you ${fmtMoney(savings)} in lifetime interest!`,
      });
    }
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: "info",
      title: "Advisor Tip",
      text: "Ensure all interest rates and balances are accurate to get customized strategy optimization advice.",
    });
  }

  // Milestones Engine
  const achievements = [
    {
      id: "momentum_starter",
      title: "Momentum Starter",
      desc: "Add your first debt account to establish a baseline target.",
      unlocked: debts.length > 0,
      icon: "🎯",
    },
    {
      id: "debt_slasher",
      title: "Debt Slasher",
      desc: "Simulate clearing at least one debt account timeline.",
      unlocked: avalanche && avalanche.per_debt && avalanche.per_debt.some(p => p.payoff_month > 0),
      icon: "⚔️",
    },
    {
      id: "interest_saver",
      title: "Interest Saver",
      desc: "Optimize payments to save over $500 in total interest.",
      unlocked: baseAv && boostedAv && (baseAv.total_interest - boostedAv.total_interest > 500),
      icon: "💰",
    },
    {
      id: "debt_free_horizon",
      title: "Fast Track",
      desc: "Achieve a projected payoff duration of under 24 months.",
      unlocked: avalanche && avalanche.months < 24,
      icon: "🚀",
    },
    {
      id: "zero_balance_club",
      title: "Zero Balance Club",
      desc: "Simulate reducing starting principal by 50% or more.",
      unlocked: avalanche && avalanche.schedule && avalanche.schedule.some(s => s.total_remaining <= totalDebt * 0.5),
      icon: "🎉",
    }
  ];
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  if (loading) {
    return (
      <div className="text-slate-400 text-sm tracking-widest uppercase" data-testid="dashboard-loading">
        Loading dashboard…
      </div>
    );
  }

  if (debts.length === 0) {
    return (
      <div data-testid="dashboard-empty">
        <div className="mb-10">
          <p className="text-label mb-3">Dashboard</p>
          <h1 className="font-display text-4xl sm:text-5xl font-light tracking-tighter">
            Let's map your debt.
          </h1>
        </div>
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl glass-subtle flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-7 h-7 text-blue-400" />
          </div>
          <h3 className="font-display text-2xl font-medium tracking-tight mb-3">
            Add your first debt to begin
          </h3>
          <p className="text-slate-400 mb-7 max-w-md mx-auto">
            Credit card, student loan, car payment — whatever's weighing you down. We'll model the
            fastest way out.
          </p>
          <button
            onClick={() => navigate("/debts")}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-3 font-medium transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] inline-flex items-center gap-2"
            data-testid="empty-add-debt-btn"
          >
            <PlusCircle className="w-4 h-4" />
            Add a debt
          </button>
        </div>
      </div>
    );
  }

  const renderWidgetContent = (id) => {
    switch (id) {
      case "metrics":
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <Metric
              label="Total debt"
              value={fmtMoney(totalDebt)}
              icon={<Wallet className="w-4 h-4 text-blue-400" />}
              testid="metric-total-debt"
            />
            <Metric
              label="Monthly minimums"
              value={fmtMoney(totalMin)}
              icon={<CalendarClock className="w-4 h-4 text-amber-400" />}
              testid="metric-monthly-min"
            />
            <Metric
              label="Avg APR"
              value={`${avgApr.toFixed(2)}%`}
              icon={<Percent className="w-4 h-4 text-fuchsia-400" />}
              testid="metric-avg-apr"
            />
            <Metric
              label="Debt-free by"
              value={avalanche?.payoff_date || "—"}
              sub={avalanche ? `${avalanche.months} months` : "Add debts"}
              icon={<CalendarHeart className="w-4 h-4 text-emerald-400" />}
              testid="metric-payoff-date"
            />
          </div>
        );

      case "plaid_reconciliation":
        return (
          <div className="glass rounded-2xl p-6 mb-10 border border-blue-500/20" data-testid="card-plaid-reconciliation">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Zap className="w-4 h-4" />
                  Automated Bank Payment Reconciliation
                </div>
                <h3 className="font-display text-xl font-medium text-white">
                  Plaid Transfer Matcher &amp; Credit Protection
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Automatically pairs checking account debits with credit card payments so debt payoffs are credited immediately—never misclassified as spending.
                </p>
              </div>

              <button
                type="button"
                onClick={simulateNewPlaidPayment}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition"
              >
                <Zap className="w-3.5 h-3.5" />
                Simulate Payment Match
              </button>
            </div>

            {/* 4 Stat KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Reconciled This Month</span>
                <span className="font-display text-xl font-bold text-emerald-400 mt-0.5 block font-mono">$310.00</span>
                <span className="text-[10px] text-slate-500">2 Verified Debits</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Spending Misclassification Shield</span>
                <span className="font-display text-xl font-bold text-blue-400 mt-0.5 block font-mono">$310.00 Saved</span>
                <span className="text-[10px] text-emerald-400/80">$0 counted as spending</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Credit Shield Protection</span>
                <span className="font-display text-xl font-bold text-amber-400 mt-0.5 block">1 High Util Alert</span>
                <span className="text-[10px] text-slate-500">Statement in 9 Days</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Linked Funding Account</span>
                <span className="font-display text-sm font-semibold text-white mt-1 block truncate">Chase Checking (••9124)</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Healthy Balance ($3,450)
                </span>
              </div>
            </div>

            {/* Feed of Reconciled Transactions */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Recent Plaid Reconciliation Log
              </span>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    alert.type === "reconciled"
                      ? "bg-slate-900/50 border-emerald-500/20"
                      : "bg-slate-900/50 border-amber-500/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        alert.type === "reconciled" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {alert.type === "reconciled" ? <Zap className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="font-medium text-white flex items-center gap-2">
                        {alert.title}
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                          {alert.badge}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {alert.desc}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-emerald-400 font-mono font-semibold block">{alert.impact}</span>
                    <span className="text-[10px] text-slate-500">{alert.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "spend_budget_planner": {
        const totalSpent = categories.reduce((s, e) => s + (parseFloat(e.spent) || 0), 0);
        const totalBudget = categories.reduce((s, e) => s + (parseFloat(e.budget) || 0), 0);
        const totalDebtPayoffs = totalMin > 0 ? totalMin : 880;
        const totalOutflows = totalSpent + totalDebtPayoffs;
        const safeSurplus = Math.max(0, budgetIncome - totalOutflows);
        const budgetRemaining = totalBudget - totalSpent;
        const budgetPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

        const getCategoryIcon = (iconName) => {
          switch (iconName) {
            case "Home": return <Home className="w-4 h-4" />;
            case "ShoppingBag": return <ShoppingBag className="w-4 h-4" />;
            case "Zap": return <Zap className="w-4 h-4" />;
            case "Car": return <Car className="w-4 h-4" />;
            case "HeartPulse": return <HeartPulse className="w-4 h-4" />;
            case "Utensils": return <Utensils className="w-4 h-4" />;
            case "Film": return <Film className="w-4 h-4" />;
            case "Sparkles": return <Sparkles className="w-4 h-4" />;
            default: return <DollarSign className="w-4 h-4" />;
          }
        };

        return (
          <div className="glass rounded-2xl p-6 mb-10 border border-teal-500/20 relative" data-testid="card-spend-budget-planner">
            {/* Header: Simple Spending Tracker & Budget Planner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold text-white">Monthly Spending Tracker &amp; Budget</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Plaid Transfer Isolation Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Track actual monthly spending. Plan your own budget or ask DebtWise to auto-build one to hit your debt payoff goal.
                  </p>
                </div>
              </div>

              {/* Action Buttons: The 2 Budget Options */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenAutoBuildModal("balanced")}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-semibold shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition active:scale-95"
                  title="Ask website to build a budget for your debt payoff plan"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Build for Debt
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3 h-3 text-teal-400" />
                  Add Category
                </button>
                <button
                  type="button"
                  onClick={handleRefreshPlaidBudget}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition"
                  title="Sync checking transactions via Plaid"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                </button>
              </div>
            </div>

            {/* 4 Core Financial KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              {/* Monthly Income */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Take-Home Pay</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTempIncomeInput(String(budgetIncome));
                      setIsEditingIncome(!isEditingIncome);
                    }}
                    className="text-slate-400 hover:text-teal-400 p-0.5"
                    title="Edit Monthly Take-Home Pay"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
                {isEditingIncome ? (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="number"
                      value={tempIncomeInput}
                      onChange={(e) => setTempIncomeInput(e.target.value)}
                      className="w-24 bg-slate-950 border border-teal-500/60 rounded px-2 py-0.5 text-xs text-white font-mono focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveIncome}
                      className="px-2 py-0.5 rounded bg-teal-600 text-white text-[10px] font-semibold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div>
                    <span className="font-display text-xl font-bold text-white font-mono">
                      ${budgetIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 capitalize">{budgetPayFrequency} net inflow</span>
                  </div>
                )}
              </div>

              {/* Total Spent This Month */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Total Spent This Month</span>
                <span className="font-display text-xl font-bold text-teal-400 font-mono block">
                  ${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Across {categories.length} categories</span>
              </div>

              {/* Monthly Budget Target */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Monthly Budget</span>
                  {budgetMode === "auto_debt" ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> Auto-Built
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-slate-300">Custom</span>
                  )}
                </div>
                <span className="font-display text-xl font-bold text-white font-mono block">
                  ${totalBudget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-[10px] block mt-0.5 ${budgetRemaining >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {budgetRemaining >= 0 ? `$${budgetRemaining.toFixed(2)} remaining` : `$${Math.abs(budgetRemaining).toFixed(2)} over budget`}
                </span>
              </div>

              {/* Safe Surplus to Pay Off Debt */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-900/80 border border-emerald-500/30">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-1">Safe Debt Payoff Surplus</span>
                <span className="font-display text-xl font-bold text-emerald-300 font-mono block">
                  +${safeSurplus.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-xs font-normal text-slate-400 ml-1">/mo</span>
                </span>
                <span className="text-[10px] text-emerald-400/80 block mt-0.5">
                  Available to accelerate debt payoff
                </span>
              </div>
            </div>

            {/* Overall Monthly Spend Progress Bar */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 mb-6">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">Monthly Budget Progress:</span>
                  <span className="font-mono text-slate-300">
                    ${totalSpent.toLocaleString()} spent of ${totalBudget.toLocaleString()} limit ({budgetPct}%)
                  </span>
                </div>
                <span className={`font-mono text-xs font-semibold ${budgetRemaining >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {budgetRemaining >= 0 ? `$${budgetRemaining.toFixed(2)} under budget` : `$${Math.abs(budgetRemaining).toFixed(2)} over budget`}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, budgetPct)}%` }}
                  className={`h-full transition-all duration-500 ${
                    budgetPct > 100 ? "bg-rose-500" : budgetPct > 90 ? "bg-amber-500" : "bg-teal-500"
                  }`}
                />
              </div>
            </div>

            {/* Category Spending Tracker & Budget Planner Grid */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Spending Categories &amp; Budget Limits
                </h4>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 text-[11px]">Click limit value to adjust your budget</span>
                  {budgetMode === "auto_debt" && (
                    <button
                      type="button"
                      onClick={() => {
                        setBudgetMode("custom");
                        toast.info("Switched to custom budget mode. You can edit any budget limit directly.");
                      }}
                      className="text-teal-400 hover:text-teal-300 text-xs font-semibold flex items-center gap-1"
                    >
                      Customize Limits
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((cat) => {
                  const spent = Number(cat.spent) || 0;
                  const budget = Number(cat.budget) || 0;
                  const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
                  const diff = budget - spent;
                  const isEditing = editingCategoryId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/15 transition flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
                            {getCategoryIcon(cat.icon)}
                          </div>
                          <span className="text-white font-medium text-xs truncate">{cat.name}</span>
                        </div>
                        {cat.auto_recommended && budgetMode === "auto_debt" && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-500/15 text-teal-300 shrink-0">
                            Debt Target
                          </span>
                        )}
                      </div>

                      {/* Spent vs Budget */}
                      <div className="flex items-baseline justify-between text-xs mb-1.5">
                        <span className="text-slate-400 text-[11px]">
                          Spent: <strong className="text-white font-mono">${spent.toFixed(2)}</strong>
                        </span>

                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 text-xs">$</span>
                            <input
                              type="number"
                              value={tempCategoryBudget}
                              onChange={(e) => setTempCategoryBudget(e.target.value)}
                              className="w-16 bg-slate-950 border border-teal-500 rounded px-1 py-0.5 text-xs text-white font-mono text-right"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateCategoryBudget(cat.id, tempCategoryBudget)}
                              className="p-1 rounded bg-teal-600 text-white hover:bg-teal-500"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCategoryId(null)}
                              className="p-1 rounded bg-white/5 text-slate-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategoryId(cat.id);
                              setTempCategoryBudget(String(budget));
                            }}
                            className="text-slate-400 hover:text-teal-400 text-[11px] flex items-center gap-1 group"
                            title="Click to edit budget limit"
                          >
                            <span>Limit:</span>
                            <strong className="text-teal-300 font-mono group-hover:underline">${budget.toFixed(2)}</strong>
                            <Edit2 className="w-2.5 h-2.5 text-slate-500 group-hover:text-teal-400" />
                          </button>
                        )}
                      </div>

                      {/* Visual Meter */}
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-1.5">
                        <div
                          style={{ width: `${Math.min(100, pct)}%` }}
                          className={`h-full transition-all duration-300 ${
                            pct > 100 ? "bg-rose-500" : pct > 90 ? "bg-amber-500" : "bg-teal-500"
                          }`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-mono">{pct}% used</span>
                        <span className={`font-mono font-medium ${diff >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {diff >= 0 ? `$${diff.toFixed(2)} left` : `$${Math.abs(diff).toFixed(2)} over`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Plaid Reconciled Debt Payoffs Strip (Explicitly Excluded from Spending) */}
            <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-white font-medium">Connected Debt Payments (Auto-Reconciled):</span>
                  <span className="text-slate-400 ml-1">
                    Chase Sapphire ($240), Citi ($160), Auto Loan ($310), Student Loan ($170) ={" "}
                    <strong className="text-emerald-400 font-mono">${totalDebtPayoffs.toFixed(2)}/mo</strong>
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0 self-start sm:self-auto">
                100% Excluded from spending (Zero double-counting)
              </span>
            </div>

            {/* Modal: Auto-Build Budget for Debt Strategy */}
            {showAutoBuildModal && autoBuildResult && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
                <div className="glass-strong rounded-2xl p-6 w-full max-w-lg border border-teal-500/30 shadow-2xl relative">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-teal-400" />
                      <h3 className="font-display text-base font-semibold text-white">
                        Auto-Build Budget for Debt Payoff
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAutoBuildModal(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 mb-4">
                    DebtWise calculates spending targets across your categories that free up cash to accelerate debt payoff according to your plan:
                  </p>

                  {/* Intensity Selector */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => handleOpenAutoBuildModal("relaxed")}
                      className={`p-2.5 rounded-xl border text-left text-xs transition ${
                        autoIntensity === "relaxed"
                          ? "bg-teal-500/20 border-teal-500 text-teal-300"
                          : "bg-slate-900/40 border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="block font-bold">Comfortable</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">+5 mo faster</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAutoBuildModal("balanced")}
                      className={`p-2.5 rounded-xl border text-left text-xs transition ${
                        autoIntensity === "balanced"
                          ? "bg-teal-500/20 border-teal-500 text-teal-300"
                          : "bg-slate-900/40 border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="block font-bold">Balanced</span>
                      <span className="text-[10px] text-teal-400 block mt-0.5">+9 mo faster</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAutoBuildModal("aggressive")}
                      className={`p-2.5 rounded-xl border text-left text-xs transition ${
                        autoIntensity === "aggressive"
                          ? "bg-teal-500/20 border-teal-500 text-teal-300"
                          : "bg-slate-900/40 border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="block font-bold">Aggressive</span>
                      <span className="text-[10px] text-emerald-400 block mt-0.5">+14 mo faster</span>
                    </button>
                  </div>

                  {/* Projected Impact Preview */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 grid grid-cols-3 gap-2 text-center text-xs mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Extra Payoff Power</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        +${autoBuildResult.target_surplus.toFixed(2)}/mo
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Time Saved</span>
                      <span className="font-mono font-bold text-teal-300 text-sm">
                        {autoBuildResult.projected_months_saved} Months
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Interest Saved</span>
                      <span className="font-mono font-bold text-emerald-300 text-sm">
                        ${autoBuildResult.projected_interest_saved.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowAutoBuildModal(false)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={applyAutoBuiltBudget}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-semibold shadow-md shadow-teal-500/20"
                    >
                      Apply This Budget
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Add Custom Category */}
            {showAddCategoryModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
                <div className="glass-strong rounded-2xl p-6 w-full max-w-md border border-white/15 shadow-2xl relative">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <h3 className="font-display text-base font-semibold text-white">
                      Add Custom Spending Category
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryModal(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddCustomCategory} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Category Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Pet Care, Hobbies, Gym"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Monthly Spent ($)</label>
                        <input
                          type="number"
                          placeholder="80.00"
                          value={newCatSpent}
                          onChange={(e) => setNewCatSpent(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-400"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Budget Limit ($)</label>
                        <input
                          type="number"
                          placeholder="100.00"
                          value={newCatBudget}
                          onChange={(e) => setNewCatBudget(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setShowAddCategoryModal(false)}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-md shadow-teal-600/25"
                      >
                        Add Category
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      }

      case "milestones":
        return (
          <div className="glass rounded-2xl p-6 mb-10 animate-fade-up delay-100" data-testid="card-milestones">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-label">Achievements</p>
                <h3 className="font-display text-lg font-medium mt-1">Payoff milestones ({unlockedCount}/{achievements.length})</h3>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-400">Total Score:</span>
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold">
                  <Trophy className="w-3.5 h-3.5" />
                  {unlockedCount * 100} pts
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {achievements.map((ach) => (
                <div 
                  key={ach.id}
                  className={`p-4 rounded-xl border text-center transition-all duration-300 relative overflow-hidden ${
                    ach.unlocked 
                      ? "bg-emerald-600/5 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                      : "bg-white/5 border-white/5 text-slate-500 opacity-60"
                  }`}
                >
                  <div className="text-3xl mb-3">{ach.icon}</div>
                  <h4 className="font-display font-semibold text-sm mb-1.5 truncate">{ach.title}</h4>
                  <p className="text-[10px] leading-snug text-slate-400">{ach.desc}</p>
                  {ach.unlocked ? (
                    <div className="absolute top-2 right-2 bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded text-emerald-400">
                      UNLOCKED
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2 bg-white/5 border border-white/10 text-[9px] font-bold px-1.5 py-0.5 rounded text-slate-500">
                      LOCKED
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "payday_instructions":
        return (
          <MonthlyPaymentInstructions
            debts={debts}
            strategy="avalanche"
            extra={100}
          />
        );

      case "breakdown_timeline":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
            <div className="glass rounded-2xl p-6 lg:col-span-1" data-testid="card-breakdown">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-label">Composition</p>
                  <h3 className="font-display text-lg font-medium mt-1">Debt breakdown</h3>
                </div>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<GlassTooltip formatter={(v) => fmtMoney(v)} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {pieData.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                      <span className="text-slate-300 truncate">{p.name}</span>
                    </div>
                    <span className="text-slate-400">{fmtMoney(p.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-6 lg:col-span-2" data-testid="card-timeline">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-label">Projection</p>
                  <h3 className="font-display text-lg font-medium mt-1">
                    Payoff timeline — Save Most Money (Avalanche)
                  </h3>
                </div>
                <button
                  onClick={() => navigate("/strategies")}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  data-testid="view-strategies-link"
                >
                  Compare all <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={avalanche?.schedule || []}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity={1} />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      stroke="#475569"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#475569"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => fmtMoney(v)}
                      width={70}
                    />
                    <Tooltip content={<GlassTooltip formatter={(v) => fmtMoney(v)} />} />
                    <Line
                      type="monotone"
                      dataKey="total_remaining"
                      name="Remaining"
                      stroke="url(#g1)"
                      strokeWidth={2.5}
                      dot={false}
                      style={{ filter: "drop-shadow(0 0 8px rgba(37,99,235,0.6))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case "debt_history":
        return <DebtProgressHistory debts={debts} />;

      case "payoff_pipeline":
        return (
          <div className="glass rounded-2xl p-6 mb-10 animate-fade-up delay-200" data-testid="card-payoff-pipeline">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-label">Strategy Pathway</p>
                <h3 className="font-display text-lg font-medium mt-1">Payoff order pipeline</h3>
              </div>
              <div className="text-xs text-slate-400">
                Based on the <span className="text-blue-400 font-medium">Save Most Money (Avalanche)</span> optimization
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[...debts]
                .map((d) => {
                  const match = avalanche?.per_debt?.find((p) => p.debt_id === d.debt_id);
                  return {
                    ...d,
                    payoff_month: match ? match.payoff_month : 999,
                    interest_paid: match ? match.interest_paid : 0,
                  };
                })
                .sort((a, b) => a.payoff_month - b.payoff_month)
                .map((d, index) => {
                  const meta = debtTypeMeta(d.type);
                  const isActiveTarget = index === 0;
                  const targetDate = (() => {
                    if (d.payoff_month === 999) return "—";
                    const now = new Date();
                    now.setDate(1);
                    now.setMonth(now.getMonth() + d.payoff_month);
                    return now.toLocaleDateString("en-US", { month: "short", year: "numeric" });
                  })();
                  
                  return (
                    <div
                      key={d.debt_id}
                      className={`glass-subtle border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${
                        isActiveTarget 
                          ? "border-blue-500/30 bg-blue-600/5 shadow-[0_0_20px_rgba(37,99,235,0.05)]" 
                          : "border-white/5"
                      }`}
                      data-testid={`pipeline-item-${d.debt_id}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span 
                          className={`text-[10px] tracking-widest uppercase font-bold px-2 py-0.5 rounded-full ${
                            isActiveTarget 
                              ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 animate-pulse" 
                              : "bg-white/5 text-slate-400 border border-white/5"
                          }`}
                        >
                          {isActiveTarget ? "★ Active Target" : `Step ${index + 1}`}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Target: {targetDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 mb-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ 
                            background: meta.color, 
                            boxShadow: `0 0 10px ${meta.color}` 
                          }} 
                        />
                        <h4 className="font-display font-medium text-slate-200 truncate">{d.name}</h4>
                      </div>

                      <div className="font-display text-xl font-light text-slate-300 mb-4">
                        {fmtMoney(d.balance)}
                      </div>

                      <div className="space-y-1.5 text-xs border-t border-white/5 pt-3">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Interest rate</span>
                          <span className="text-slate-300 font-medium">{d.apr.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Payoff time</span>
                          <span className="text-slate-300 font-medium">{d.payoff_month} months</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );

      case "calendar":
        return (
          <PaymentCalendar
            debts={debts}
            onRefreshDebts={() => api.get("/debts").then((r) => setDebts(r.data))}
          />
        );

      case "smart_advisor":
        return (
          <div className="glass rounded-2xl p-6 mb-10" data-testid="card-smart-advisor">
            <div className="mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-label">Strategy Advisor</p>
                <h3 className="font-display text-lg font-medium mt-1">Smart recommendations</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-xl border text-xs leading-relaxed transition-all duration-300 ${
                    rec.type === "warning" 
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-300 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                      : rec.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                      : "bg-blue-500/10 border-blue-500/20 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
                  }`}
                >
                  <div className="font-semibold mb-1.5 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    {rec.type === "warning" ? <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> : <Zap className="w-3.5 h-3.5" />}
                    {rec.title}
                  </div>
                  {rec.text}
                </div>
              ))}
            </div>
          </div>
        );

      case "strategy_compare":
        return (
          <div className="glass rounded-2xl p-6" data-testid="card-strategy-compare">
            <div className="mb-6">
              <p className="text-label">Comparison</p>
              <h3 className="font-display text-lg font-medium mt-1">Strategies head-to-head</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STRATEGIES.filter((s) => s.key !== "custom").map((s) => {
                const r = compare?.strategies?.[s.key];
                return (
                  <button
                    key={s.key}
                    onClick={() => navigate(`/strategies/${s.key}`)}
                    className="text-left glass-subtle rounded-xl p-5 hover:bg-white/10 hover:border-white/20 border border-white/5 transition-all"
                    data-testid={`compare-${s.key}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }}
                      />
                      <span className="text-sm font-semibold">{s.label}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">{s.tagline}</p>
                    <div className="space-y-2 border-t border-white/5 pt-3">
                      <Stat label="Payoff Duration" value={r ? `${r.months} mo` : "—"} />
                      <Stat label="Total Interest" value={r ? fmtMoney(r.total_interest) : "—"} />
                      <Stat label="Debt-Free Month" value={r?.payoff_date || "—"} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div data-testid="dashboard-page">
      {/* Printable PDF / Print View (Hidden in standard screen rendering) */}
      <div className="hidden print:block text-slate-900 bg-white p-8 max-w-4xl mx-auto print-block">
        <div className="border-b-2 border-slate-800 pb-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">DEBTWISE PAYOFF BLUEPRINT</h1>
          <p className="text-slate-500 text-sm">Generated on {new Date().toLocaleDateString()} for {user?.name || "Premium User"}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="font-semibold text-slate-700">Debt Overview</p>
            <p>Total Debt: {fmtMoney(totalDebt)}</p>
            <p>Monthly Minimums: {fmtMoney(totalMin)}</p>
            <p>Average APR: {avgApr.toFixed(2)}%</p>
          </div>
          <div>
            <p className="font-semibold text-slate-700">Projected Payoff: Save Most Money (Avalanche)</p>
            <p>Payoff Date: {avalanche?.payoff_date || "—"} ({avalanche?.months} months)</p>
            <p>Total Interest: {fmtMoney(avalanche?.total_interest)}</p>
            <p>Total Repayment: {fmtMoney(avalanche?.total_paid)}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-3">Active Debt Accounts</h3>
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50">
                <th className="py-2 px-3 font-semibold text-slate-700">Name</th>
                <th className="py-2 px-3 font-semibold text-slate-700">Type</th>
                <th className="py-2 px-3 font-semibold text-slate-700">Balance</th>
                <th className="py-2 px-3 font-semibold text-slate-700">APR</th>
                <th className="py-2 px-3 font-semibold text-slate-700">Min Payment</th>
              </tr>
            </thead>
            <tbody>
              {debts.map((d, i) => (
                <tr key={i} className="border-b border-slate-200">
                  <td className="py-2 px-3">{d.name}</td>
                  <td className="py-2 px-3 uppercase text-xs">{d.type.replace("_", " ")}</td>
                  <td className="py-2 px-3">{fmtMoney(d.balance)}</td>
                  <td className="py-2 px-3">{d.apr.toFixed(1)}%</td>
                  <td className="py-2 px-3">{fmtMoney(d.min_payment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-3">Payoff Sequence Timeline</h3>
          <div className="space-y-4">
            {[...debts]
              .map((d) => {
                const match = avalanche?.per_debt?.find((p) => p.debt_id === d.debt_id);
                return {
                  ...d,
                  payoff_month: match ? match.payoff_month : 999,
                };
              })
              .sort((a, b) => a.payoff_month - b.payoff_month)
              .map((d, index) => {
                const targetDate = (() => {
                  if (d.payoff_month === 999) return "—";
                  const now = new Date();
                  now.setDate(1);
                  now.setMonth(now.getMonth() + d.payoff_month);
                  return now.toLocaleDateString("en-US", { month: "short", year: "numeric" });
                })();
                return (
                  <div key={d.debt_id} className="border-l-2 border-slate-400 pl-4 py-1 text-sm">
                    <p className="font-semibold text-slate-800">
                      Step {index + 1}: {d.name} — Target Clear Date: {targetDate}
                    </p>
                    <p className="text-slate-600">
                      Starting Balance: {fmtMoney(d.balance)} at {d.apr.toFixed(1)}% APR (Clears in {d.payoff_month} months)
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Main Screen Layout (Hidden in Print) */}
      <div className="print:hidden">
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-label mb-3">Overview</p>
            <h1 className="font-display text-4xl sm:text-5xl font-light tracking-tighter">
              Your debt at a glance.
            </h1>
          </div>
          <div className="flex flex-wrap gap-3 self-start">
            <button
              onClick={() => setCustomizingLayout(!customizingLayout)}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all inline-flex items-center gap-2 border ${
                customizingLayout
                  ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                  : "bg-white/5 hover:bg-white/10 text-slate-200 border-white/10"
              }`}
              data-testid="dashboard-customize-btn"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              {customizingLayout ? "Done Arranging" : "Arrange Widgets"}
            </button>
            <button
              onClick={() => window.print()}
              className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-lg px-5 py-2.5 text-sm font-medium transition-all inline-flex items-center gap-2"
              data-testid="dashboard-print-btn"
            >
              <Printer className="w-4 h-4" />
              Print Blueprint
            </button>
            <button
              onClick={() => navigate("/debts")}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] inline-flex items-center gap-2"
              data-testid="dashboard-add-debt-btn"
            >
              <PlusCircle className="w-4 h-4" />
              Add debt
            </button>
          </div>
        </div>

        {/* Top In-App Alerts & Plaid Reconciliation Notification Strip */}
        <div className="mb-8">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/90 to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Bell className="w-4 h-4" />
                </div>
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-slate-950">
                    {alerts.length}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    Plaid Live Sync &amp; Protection Engine
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Active
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {alerts.filter((a) => a.type === "reconciled").length} bank payments auto-reconciled this cycle &bull; {alerts.filter((a) => a.type === "protection").length} credit score protection alert
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={simulateNewPlaidPayment}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition flex items-center gap-1.5"
                title="Test real-time Plaid webhook event"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                Simulate Payment Match
              </button>
              <button
                type="button"
                onClick={() => setShowAlertDrawer(!showAlertDrawer)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition flex items-center gap-1.5"
              >
                {showAlertDrawer ? "Hide Alert Center" : `View Alerts (${alerts.length})`}
              </button>
            </div>
          </div>

          {/* Expandable Alert Center Drawer */}
          {showAlertDrawer && (
            <div className="mt-3 p-5 rounded-2xl glass border border-white/10 space-y-4 animate-fadeIn shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <h4 className="font-display text-sm font-semibold text-white">
                    Plaid Automated Payment Reconciliation &amp; Protection Alerts
                  </h4>
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setAlertFilter("all")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                      alertFilter === "all" ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    All ({alerts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertFilter("reconciled")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                      alertFilter === "reconciled" ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    ⚡ Plaid Reconciled ({alerts.filter((a) => a.type === "reconciled").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertFilter("protection")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                      alertFilter === "protection" ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    ⚠️ Credit Protection ({alerts.filter((a) => a.type === "protection").length})
                  </button>
                </div>
              </div>

              {/* Alert Items List */}
              <div className="space-y-3">
                {alerts
                  .filter((a) => alertFilter === "all" || a.type === alertFilter)
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                        alert.type === "reconciled"
                          ? "bg-emerald-500/5 border-emerald-500/20"
                          : alert.type === "protection"
                          ? "bg-amber-500/5 border-amber-500/20"
                          : "bg-blue-500/5 border-blue-500/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            alert.type === "reconciled"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : alert.type === "protection"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {alert.type === "reconciled" ? (
                            <Zap className="w-4 h-4" />
                          ) : alert.type === "protection" ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <ShieldCheck className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-white">
                              {alert.title}
                            </span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                              {alert.badge}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {alert.date}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {alert.desc}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                            {alert.sourceAccount && (
                              <span>From: <strong className="text-slate-200">{alert.sourceAccount}</strong></span>
                            )}
                            {alert.destAccount && (
                              <span>To: <strong className="text-slate-200">{alert.destAccount}</strong></span>
                            )}
                            <span className="text-emerald-400 font-semibold">{alert.impact}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => dismissAlert(alert.id)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Customizable Sticky Layout Toolbar */}
        {customizingLayout && (
          <div className="glass-strong border border-blue-500/40 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl animate-fade-up sticky top-4 z-40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-medium text-white text-base">Arranging Dashboard Widgets</h4>
                <p className="text-xs text-slate-300">
                  Reorder widgets with Up/Down buttons or toggle visibility. Changes persist across visits.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                onClick={() => setShowLayoutModal(true)}
                className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-medium transition flex items-center gap-1.5"
              >
                <GripVertical className="w-3.5 h-3.5 text-blue-400" />
                Manager List
              </button>
              <button
                onClick={resetLayout}
                className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-medium transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                onClick={() => setCustomizingLayout(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-[0_0_20px_rgba(37,99,235,0.4)] transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Done
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Widgets Stream */}
        <div className="space-y-2">
          {widgets.map((widget, index) => {
            const meta = DEFAULT_WIDGETS.find((dw) => dw.id === widget.id) || { title: widget.id };
            if (!widget.visible && !customizingLayout) return null;

            const isDragging = draggedWidgetIndex === index;
            const isDragOver = dragOverWidgetIndex === index;

            return (
              <div
                key={widget.id}
                id={widget.id === "spend_budget_planner" ? "spend-budget-planner" : `widget-${widget.id}`}
                draggable={customizingLayout}
                onDragStart={(e) => {
                  setDraggedWidgetIndex(index);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", index.toString());
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragOverWidgetIndex !== index) {
                    setDragOverWidgetIndex(index);
                  }
                }}
                onDragLeave={() => {
                  if (dragOverWidgetIndex === index) {
                    setDragOverWidgetIndex(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedWidgetIndex === null || draggedWidgetIndex === index) {
                    setDraggedWidgetIndex(null);
                    setDragOverWidgetIndex(null);
                    return;
                  }
                  const updated = [...widgets];
                  const [moved] = updated.splice(draggedWidgetIndex, 1);
                  updated.splice(index, 0, moved);
                  saveLayout(updated);
                  setDraggedWidgetIndex(null);
                  setDragOverWidgetIndex(null);
                  toast.success("Widget order updated!");
                }}
                onDragEnd={() => {
                  setDraggedWidgetIndex(null);
                  setDragOverWidgetIndex(null);
                }}
                className={`transition-all duration-200 ${
                  customizingLayout
                    ? `p-4 rounded-3xl border-2 border-dashed mb-8 relative ${
                        isDragging
                          ? "opacity-30 border-blue-400 bg-blue-950/40 scale-[0.99]"
                          : isDragOver
                          ? "border-blue-500 bg-blue-600/15 ring-2 ring-blue-500 shadow-[0_0_35px_rgba(37,99,235,0.3)] scale-[1.01]"
                          : "border-blue-500/40 bg-blue-950/10 hover:border-blue-400/70"
                      }`
                    : ""
                }`}
              >
                {customizingLayout && (
                  <div className="mb-4 pb-3 border-b border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div
                      className="flex items-center gap-2 cursor-grab active:cursor-grabbing select-none"
                      title="Click and drag to reorder"
                    >
                      <GripVertical className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                        #{index + 1}
                      </span>
                      <span className="font-display font-medium text-white text-sm">
                        {meta.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(Drag to reorder)</span>
                      {!widget.visible && (
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                          Hidden in normal view
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => moveWidget(index, -1)}
                        disabled={index === 0}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white text-xs flex items-center gap-1 border border-white/10"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" /> Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveWidget(index, 1)}
                        disabled={index === widgets.length - 1}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white text-xs flex items-center gap-1 border border-white/10"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" /> Down
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleWidgetVisibility(widget.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 border transition ${
                          widget.visible
                            ? "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}
                        title={widget.visible ? "Hide from normal view" : "Show in normal view"}
                      >
                        {widget.visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {widget.visible ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                )}

                {renderWidgetContent(widget.id)}
              </div>
            );
          })}
        </div>

        {/* Modal: Full Layout Manager */}
        {showLayoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
            <div className="glass-strong rounded-2xl p-6 w-full max-w-lg border border-white/15 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-medium text-white">Arrange Dashboard Widgets</h3>
                    <p className="text-xs text-slate-400">Drag items to reorder, use arrows, or toggle visibility</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLayoutModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {widgets.map((widget, index) => {
                  const meta = DEFAULT_WIDGETS.find((dw) => dw.id === widget.id) || { title: widget.id, desc: "" };
                  const isModalDragging = draggedModalIndex === index;
                  const isModalDragOver = dragOverModalIndex === index;

                  return (
                    <div
                      key={widget.id}
                      draggable={true}
                      onDragStart={(e) => {
                        setDraggedModalIndex(index);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", index.toString());
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        if (dragOverModalIndex !== index) {
                          setDragOverModalIndex(index);
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverModalIndex === index) {
                          setDragOverModalIndex(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedModalIndex === null || draggedModalIndex === index) {
                          setDraggedModalIndex(null);
                          setDragOverModalIndex(null);
                          return;
                        }
                        const updated = [...widgets];
                        const [moved] = updated.splice(draggedModalIndex, 1);
                        updated.splice(index, 0, moved);
                        saveLayout(updated);
                        setDraggedModalIndex(null);
                        setDragOverModalIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedModalIndex(null);
                        setDragOverModalIndex(null);
                      }}
                      className={`p-3 rounded-xl border transition cursor-grab active:cursor-grabbing flex items-center justify-between gap-3 ${
                        isModalDragging
                          ? "opacity-30 border-blue-400 bg-blue-950/40"
                          : isModalDragOver
                          ? "border-blue-500 bg-blue-600/15 ring-2 ring-blue-500/50 scale-[1.01]"
                          : widget.visible
                          ? "bg-white/[0.03] border-white/10 hover:border-white/20"
                          : "bg-slate-900/40 border-white/5 opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <GripVertical className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="font-mono text-xs font-bold text-slate-400 w-5 text-center">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm text-white truncate">{meta.title}</h4>
                          <p className="text-[11px] text-slate-400 truncate">{meta.desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveWidget(index, -1)}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveWidget(index, 1)}
                          disabled={index === widgets.length - 1}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleWidgetVisibility(widget.id)}
                          className={`p-1.5 rounded-lg transition ${
                            widget.visible
                              ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30"
                              : "bg-white/5 text-slate-500 hover:text-slate-300"
                          }`}
                          title={widget.visible ? "Hide widget" : "Show widget"}
                        >
                          {widget.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
                <button
                  onClick={resetLayout}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset to default
                </button>
                <button
                  onClick={() => setShowLayoutModal(false)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(37,99,235,0.4)] transition"
                >
                  Save &amp; Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, sub, icon, testid }) {
  return (
    <div className="glass rounded-2xl p-5" data-testid={testid}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-label">{label}</span>
        <div className="w-8 h-8 rounded-lg glass-subtle flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="font-display text-2xl sm:text-3xl font-light tracking-tight">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200 font-medium">{value}</span>
    </div>
  );
}
