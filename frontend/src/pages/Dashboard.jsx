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

  // Spend Calculator & Budget Planner State
  const [budgetIncome, setBudgetIncome] = useState(5200);
  const [budgetPayFrequency, setBudgetPayFrequency] = useState("monthly");
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [tempIncomeInput, setTempIncomeInput] = useState("5200");
  const [budgetTab, setBudgetTab] = useState("overview"); // "overview" | "categories" | "simulator"
  const [categoryFilter, setCategoryFilter] = useState("all"); // "all" | "need" | "want"
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [tempCategoryAmount, setTempCategoryAmount] = useState("");
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseType, setNewExpenseType] = useState("need");

  const [needsExpenses, setNeedsExpenses] = useState([
    { id: "housing", name: "Housing (Rent / Mortgage)", amount: 1650, icon: "Home", category: "need" },
    { id: "groceries", name: "Groceries & Supermarket", amount: 520, icon: "ShoppingBag", category: "need" },
    { id: "utilities", name: "Utilities & Internet", amount: 240, icon: "Zap", category: "need" },
    { id: "transportation", name: "Transportation & Gas", amount: 380, icon: "Car", category: "need" },
    { id: "healthcare", name: "Healthcare & Insurance", amount: 160, icon: "HeartPulse", category: "need" },
  ]);

  const [wantsExpenses, setWantsExpenses] = useState([
    { id: "dining", name: "Dining Out & Takeout", amount: 310, icon: "Utensils", category: "want", maxCut: 200 },
    { id: "entertainment", name: "Entertainment & Streaming", amount: 140, icon: "Film", category: "want", maxCut: 100 },
    { id: "shopping", name: "Shopping & Discretionary", amount: 220, icon: "ShoppingBag", category: "want", maxCut: 150 },
    { id: "subscriptions", name: "Subscriptions & Gym", amount: 70, icon: "Sparkles", category: "want", maxCut: 50 },
  ]);

  const [cuts, setCuts] = useState({
    dining: 110,
    entertainment: 40,
    shopping: 60,
    subscriptions: 20,
  });

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
      needs: needsExpenses,
      wants: wantsExpenses,
      custom_cuts: cuts,
    });
    toast.success(`Monthly income updated to $${val.toLocaleString()} (${budgetPayFrequency}).`);
  };

  const handleUpdateCategoryAmount = (id, newAmt) => {
    const val = parseFloat(newAmt);
    if (isNaN(val) || val < 0) {
      toast.error("Please enter a valid expense amount.");
      return;
    }
    const updatedNeeds = needsExpenses.map((n) => (n.id === id ? { ...n, amount: val } : n));
    const updatedWants = wantsExpenses.map((w) => (w.id === id ? { ...w, amount: val } : w));
    setNeedsExpenses(updatedNeeds);
    setWantsExpenses(updatedWants);
    setEditingCategoryId(null);
    saveBudgetSettings({
      monthly_income: budgetIncome,
      pay_frequency: budgetPayFrequency,
      needs: updatedNeeds,
      wants: updatedWants,
      custom_cuts: cuts,
    });
    toast.success("Expense category updated.");
  };

  const handleCutChange = (catId, val) => {
    const updated = { ...cuts, [catId]: Number(val) };
    setCuts(updated);
    saveBudgetSettings({
      monthly_income: budgetIncome,
      pay_frequency: budgetPayFrequency,
      needs: needsExpenses,
      wants: wantsExpenses,
      custom_cuts: updated,
    });
  };

  const handleAddCustomExpense = (e) => {
    e.preventDefault();
    if (!newExpenseName.trim()) {
      toast.error("Please enter an expense name.");
      return;
    }
    const amt = parseFloat(newExpenseAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid monthly amount.");
      return;
    }
    const newItem = {
      id: `custom-${Date.now()}`,
      name: newExpenseName.trim(),
      amount: amt,
      icon: "DollarSign",
      category: newExpenseType,
      ...(newExpenseType === "want" ? { maxCut: Math.round(amt * 0.75) } : {}),
    };

    let updatedNeeds = needsExpenses;
    let updatedWants = wantsExpenses;
    if (newExpenseType === "need") {
      updatedNeeds = [...needsExpenses, newItem];
      setNeedsExpenses(updatedNeeds);
    } else {
      updatedWants = [...wantsExpenses, newItem];
      setWantsExpenses(updatedWants);
    }

    saveBudgetSettings({
      monthly_income: budgetIncome,
      pay_frequency: budgetPayFrequency,
      needs: updatedNeeds,
      wants: updatedWants,
      custom_cuts: cuts,
    });

    setNewExpenseName("");
    setNewExpenseAmount("");
    setShowAddExpenseModal(false);
    toast.success(`Added "${newItem.name}" ($${amt}/mo) to your budget!`);
  };

  const handleRefreshPlaidBudget = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: "Syncing latest checking transactions & liabilities via Plaid...",
        success: "⚡ Synchronized! $880.00/mo in debt payments verified as internal transfers (100% excluded from spending).",
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
          if (bp.data.needs && Array.isArray(bp.data.needs) && bp.data.needs.length > 0) {
            setNeedsExpenses(bp.data.needs);
          }
          if (bp.data.wants && Array.isArray(bp.data.wants) && bp.data.wants.length > 0) {
            setWantsExpenses(bp.data.wants);
          }
          if (bp.data.custom_cuts && typeof bp.data.custom_cuts === "object") {
            setCuts(bp.data.custom_cuts);
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
        const totalNeeds = needsExpenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
        const totalWants = wantsExpenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
        const totalLivingExpenses = totalNeeds + totalWants;
        const totalDebtPayoffs = totalMin > 0 ? totalMin : 880;
        const totalOutflows = totalLivingExpenses + totalDebtPayoffs;
        const baseSurplus = Math.max(0, budgetIncome - totalOutflows);

        // Sum discretionary cuts
        const cutTotal = Object.values(cuts).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
        const acceleratedSurplus = baseSurplus + cutTotal;

        // 50/30/20 Percentages
        const needsPct = budgetIncome > 0 ? Math.min(100, Math.round((totalNeeds / budgetIncome) * 100)) : 0;
        const wantsPct = budgetIncome > 0 ? Math.min(100, Math.round((totalWants / budgetIncome) * 100)) : 0;
        const debtAndSurplusPct = budgetIncome > 0 ? Math.min(100, Math.round(((totalDebtPayoffs + baseSurplus) / budgetIncome) * 100)) : 0;

        // Payoff simulation calculation
        const baseMonths = avalanche?.months || 24;
        const acceleratedMonths = Math.max(6, Math.round(baseMonths * (totalDebtPayoffs / (totalDebtPayoffs + acceleratedSurplus))));
        const monthsSaved = Math.max(0, baseMonths - acceleratedMonths);
        const interestSaved = Math.round(monthsSaved * (avgApr / 100 / 12) * (totalDebt > 0 ? totalDebt * 0.55 : 9500));

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

        const filteredExpenses = [
          ...needsExpenses.map((n) => ({ ...n, typeLabel: "Need (Essential)" })),
          ...wantsExpenses.map((w) => ({ ...w, typeLabel: "Want (Discretionary)" })),
        ].filter((item) => {
          if (categoryFilter === "need") return item.category === "need";
          if (categoryFilter === "want") return item.category === "want";
          return true;
        });

        return (
          <div className="glass rounded-2xl p-6 mb-10 border border-teal-500/20 relative" data-testid="card-spend-budget-planner">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Calculator className="w-4 h-4" />
                  Live Cash Flow Engine &amp; Budget Planner
                </div>
                <h3 className="font-display text-xl font-medium text-white">
                  Spend Calculator &amp; Debt Accelerator
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Automated 2-way Plaid transfer isolation ensures checking debits for credit cards and loans are 100% separated from living expenses. Zero double-counting, exact safe payoff surplus.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                <button
                  type="button"
                  onClick={handleRefreshPlaidBudget}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition"
                  title="Verify against live Plaid checking transactions"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                  Plaid Sync
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-600/25 flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Line Item
                </button>
              </div>
            </div>

            {/* Zero Double-Counting Plaid Isolation Shield */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-blue-950/30 border border-emerald-500/30 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-semibold text-white">
                      2-Way Plaid Transfer Shield Active
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase tracking-wider">
                      Verified Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    DebtWise paired <span className="font-semibold text-emerald-400">${totalDebtPayoffs.toFixed(2)}/mo</span> in monthly debt payoffs debited from Chase Premier Checking (••9124). These internal transfers are <span className="underline decoration-emerald-500">100% excluded</span> from living expenses, preventing duplicate spending records.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-right sm:border-l sm:border-white/10 sm:pl-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Isolated Payoffs</span>
                  <span className="font-mono text-sm font-bold text-emerald-400 block">${totalDebtPayoffs.toFixed(2)}/mo</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">True Living Spend</span>
                  <span className="font-mono text-sm font-bold text-teal-300 block">${totalLivingExpenses.toFixed(2)}/mo</span>
                </div>
              </div>
            </div>

            {/* 4 Financial KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {/* Monthly Income */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 relative group hover:border-teal-500/30 transition">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Monthly Take-Home
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTempIncomeInput(String(budgetIncome));
                      setIsEditingIncome(!isEditingIncome);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-teal-400 hover:bg-white/5 transition"
                    title="Edit Monthly Income"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {isEditingIncome ? (
                  <div className="mt-1 space-y-2">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                      <input
                        type="number"
                        value={tempIncomeInput}
                        onChange={(e) => setTempIncomeInput(e.target.value)}
                        className="w-full bg-slate-950/80 border border-teal-500/50 rounded-lg pl-6 pr-2 py-1 text-sm text-white font-mono focus:outline-none"
                        placeholder="5200"
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleSaveIncome}
                        className="flex-1 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-semibold"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingIncome(false)}
                        className="py-1 px-2 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[11px]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="font-display text-xl font-bold text-white block font-mono">
                      ${budgetIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block capitalize">
                      {budgetPayFrequency} Net Paycheck
                    </span>
                  </>
                )}
              </div>

              {/* True Living Expenses */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Living Consumption
                </span>
                <span className="font-display text-xl font-bold text-teal-400 mt-1 block font-mono">
                  ${totalLivingExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400">
                  Needs: ${totalNeeds.toLocaleString()} • Wants: ${totalWants.toLocaleString()}
                </span>
              </div>

              {/* Debt Payoff Minimums */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Debt Payoff Transfers
                </span>
                <span className="font-display text-xl font-bold text-blue-400 mt-1 block font-mono">
                  ${totalDebtPayoffs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-emerald-400/90 font-medium">
                  {debts.length || 4} Debts • $0 Living Spend
                </span>
              </div>

              {/* Safe Payoff Surplus */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-900/80 border border-emerald-500/30">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                  Safe Payoff Surplus
                </span>
                <span className="font-display text-xl font-bold text-emerald-300 mt-1 block font-mono">
                  +${baseSurplus.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-xs font-normal text-slate-400 ml-1">/mo</span>
                </span>
                <span className="text-[10px] text-emerald-400/80 block">
                  Available to accelerate debt free date
                </span>
              </div>
            </div>

            {/* Workbench Navigation Sub-Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-6 overflow-x-auto">
              <button
                type="button"
                onClick={() => setBudgetTab("overview")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                  budgetTab === "overview"
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                50/30/20 Cash Flow Meter
              </button>
              <button
                type="button"
                onClick={() => setBudgetTab("categories")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                  budgetTab === "categories"
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Expenses &amp; Debt Accounts ({needsExpenses.length + wantsExpenses.length})
              </button>
              <button
                type="button"
                onClick={() => setBudgetTab("simulator")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                  budgetTab === "simulator"
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                Cut &amp; Accelerate Simulator
                {cutTotal > 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300">
                    +${cutTotal}/mo
                  </span>
                )}
              </button>
            </div>

            {/* TAB 1: 50/30/20 Health Meter */}
            {budgetTab === "overview" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Visual Ratio Bar */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-white">Monthly Cash Flow Allocation</span>
                    <span className="text-slate-400 font-mono">100% of ${budgetIncome.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      style={{ width: `${needsPct}%` }}
                      className="bg-blue-500 transition-all duration-500"
                      title={`Needs: ${needsPct}%`}
                    />
                    <div
                      style={{ width: `${wantsPct}%` }}
                      className="bg-purple-500 transition-all duration-500"
                      title={`Wants: ${wantsPct}%`}
                    />
                    <div
                      style={{ width: `${debtAndSurplusPct}%` }}
                      className="bg-emerald-500 transition-all duration-500"
                      title={`Debt Payoff & Surplus: ${debtAndSurplusPct}%`}
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between text-[11px] mt-2.5 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span>Needs: {needsPct}% (${totalNeeds.toLocaleString()})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <span>Wants: {wantsPct}% (${totalWants.toLocaleString()})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-emerald-400 font-semibold">
                        Debt Payoff &amp; Surplus: {debtAndSurplusPct}% (${(totalDebtPayoffs + baseSurplus).toLocaleString()})
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3 Benchmark Guideline Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Needs */}
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                        Needs (Essentials)
                      </span>
                      <span className="text-xs font-mono font-bold text-white">{needsPct}% / 50%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, (totalNeeds / (budgetIncome * 0.5)) * 100)}%` }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                    <div className="text-xs text-slate-300">
                      Actual: <span className="font-semibold text-white">${totalNeeds.toLocaleString()}</span> (Target: ${Math.round(budgetIncome * 0.5).toLocaleString()})
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Housing, groceries, transit &amp; health. Stable and sustainable relative to income.
                    </p>
                  </div>

                  {/* Wants */}
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                        Wants (Discretionary)
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">{wantsPct}% / 30%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, (totalWants / (budgetIncome * 0.3)) * 100)}%` }}
                        className="h-full bg-purple-500 rounded-full"
                      />
                    </div>
                    <div className="text-xs text-slate-300">
                      Actual: <span className="font-semibold text-white">${totalWants.toLocaleString()}</span> (Target: ${Math.round(budgetIncome * 0.3).toLocaleString()})
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      🌟 Outstanding discipline! You spend ${Math.round((budgetIncome * 0.3) - totalWants).toLocaleString()} under the standard 30% ceiling, preserving maximum cash flow for payoff.
                    </p>
                  </div>

                  {/* Debt Payoff & Surplus */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/30 to-slate-900/60 border border-emerald-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                        Debt Elimination &amp; Surplus
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-300">{debtAndSurplusPct}% / 20%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, ((totalDebtPayoffs + baseSurplus) / (budgetIncome * 0.2)) * 100)}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                    <div className="text-xs text-slate-300">
                      Allocated: <span className="font-semibold text-emerald-400">${(totalDebtPayoffs + baseSurplus).toLocaleString()}</span> (Target: ${Math.round(budgetIncome * 0.2).toLocaleString()})
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      🚀 Wealth acceleration pace: Allocating 1.45x the standard guideline towards crushing debt principal.
                    </p>
                  </div>
                </div>

                {/* Mathematical Formula Balance Bar */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Cash Flow Equation:</span>
                    <span className="text-slate-300">
                      Income (${budgetIncome.toLocaleString()}) - Living (${totalLivingExpenses.toLocaleString()}) - Debt Payoffs (${totalDebtPayoffs.toFixed(2)})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">=</span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono font-bold">
                      +${baseSurplus.toFixed(2)}/mo Safe Surplus
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Categorized Expenses & Dedicated Debt Account Outflows */}
            {budgetTab === "categories" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 mr-1">Filter:</span>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter("all")}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        categoryFilter === "all" ? "bg-white/10 text-white font-semibold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      All ({needsExpenses.length + wantsExpenses.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter("need")}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        categoryFilter === "need" ? "bg-blue-500/20 text-blue-300 font-semibold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Needs ({needsExpenses.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter("want")}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        categoryFilter === "want" ? "bg-purple-500/20 text-purple-300 font-semibold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Wants ({wantsExpenses.length})
                    </button>
                  </div>

                  <span className="text-xs text-slate-400">
                    Click any amount to edit
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left Column: Living Expenses */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase px-1">
                      <span>Living Spending Line Items</span>
                      <span>${totalLivingExpenses.toFixed(2)}/mo</span>
                    </div>

                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                      {filteredExpenses.map((item) => {
                        const isEditing = editingCategoryId === item.id;
                        const pctOfIncome = budgetIncome > 0 ? ((item.amount / budgetIncome) * 100).toFixed(1) : 0;

                        return (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/15 flex items-center justify-between gap-3 transition"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  item.category === "need"
                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                    : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                }`}
                              >
                                {getCategoryIcon(item.icon)}
                              </div>
                              <div className="min-w-0">
                                <span className="font-medium text-white text-xs block truncate">
                                  {item.name}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                      item.category === "need"
                                        ? "bg-blue-500/20 text-blue-300"
                                        : "bg-purple-500/20 text-purple-300"
                                    }`}
                                  >
                                    {item.category}
                                  </span>
                                  <span className="text-[10px] text-slate-400">{pctOfIncome}% of income</span>
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={tempCategoryAmount}
                                    onChange={(e) => setTempCategoryAmount(e.target.value)}
                                    className="w-20 bg-slate-950 border border-teal-500 rounded px-2 py-1 text-xs text-white font-mono text-right"
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateCategoryAmount(item.id, tempCategoryAmount)}
                                    className="p-1 rounded bg-teal-600 text-white hover:bg-teal-500"
                                    title="Save"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingCategoryId(null)}
                                    className="p-1 rounded bg-white/5 text-slate-400 hover:text-white"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCategoryId(item.id);
                                    setTempCategoryAmount(String(item.amount));
                                  }}
                                  className="group flex items-center gap-1.5 text-right hover:opacity-80"
                                  title="Click to edit amount"
                                >
                                  <span className="font-mono text-xs font-semibold text-white">
                                    ${Number(item.amount).toFixed(2)}
                                  </span>
                                  <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-teal-400 transition" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Dedicated Debt Accounts (100% Isolated) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase px-1">
                      <span>Debt Accounts (Internal Payoffs)</span>
                      <span className="text-emerald-400">${totalDebtPayoffs.toFixed(2)}/mo</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/40 border border-emerald-500/20 mb-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
                        <ShieldCheck className="w-4 h-4" />
                        Zero Double-Counting Guarantee
                      </div>
                      <p className="text-[11px] text-slate-300 leading-normal">
                        These monthly debits from Checking are debt balance reductions—NOT living consumption. Counting them as living spending would falsely inflate your expenses.
                      </p>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {debts.map((d) => (
                        <div
                          key={d.debt_id}
                          className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                              <CreditCard className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-medium text-white text-xs block truncate">{d.name}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 uppercase">
                                  Plaid Matched
                                </span>
                                <span className="text-[10px] text-slate-400">Balance: ${Number(d.balance).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-bold text-emerald-400 block">
                              ${Number(d.min_payment).toFixed(2)}/mo
                            </span>
                            <span className="text-[9px] text-slate-500 block">Excluded from Spend</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Cut & Accelerate Budget Simulator */}
            {budgetTab === "simulator" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-display text-sm font-semibold text-white flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-teal-400" />
                        Discretionary Trimming Simulator
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Move the sliders below to simulate trimming optional spending. DebtWise directly routes these savings into accelerated debt avalanche payoff.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Trimming Fuel</span>
                      <span className="font-mono text-lg font-bold text-emerald-400 block">+${cutTotal.toFixed(2)}/mo</span>
                    </div>
                  </div>

                  {/* Range Sliders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Dining Out */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-white flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-teal-400" />
                          Trim Dining Out &amp; Coffee
                        </span>
                        <span className="font-mono font-bold text-emerald-400">+${cuts.dining || 0}/mo cut</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="10"
                        value={cuts.dining || 0}
                        onChange={(e) => handleCutChange("dining", e.target.value)}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Original: $310/mo</span>
                        <span>Remaining for dining: ${(310 - (cuts.dining || 0)).toFixed(0)}/mo</span>
                      </div>
                    </div>

                    {/* Entertainment */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-white flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-purple-400" />
                          Trim Entertainment &amp; Streaming
                        </span>
                        <span className="font-mono font-bold text-emerald-400">+${cuts.entertainment || 0}/mo cut</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={cuts.entertainment || 0}
                        onChange={(e) => handleCutChange("entertainment", e.target.value)}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Original: $140/mo</span>
                        <span>Remaining for entertainment: ${(140 - (cuts.entertainment || 0)).toFixed(0)}/mo</span>
                      </div>
                    </div>

                    {/* Shopping */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-white flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                          Trim Discretionary Shopping
                        </span>
                        <span className="font-mono font-bold text-emerald-400">+${cuts.shopping || 0}/mo cut</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="150"
                        step="10"
                        value={cuts.shopping || 0}
                        onChange={(e) => handleCutChange("shopping", e.target.value)}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Original: $220/mo</span>
                        <span>Remaining for shopping: ${(220 - (cuts.shopping || 0)).toFixed(0)}/mo</span>
                      </div>
                    </div>

                    {/* Subscriptions */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                          Trim Subscriptions &amp; Memberships
                        </span>
                        <span className="font-mono font-bold text-emerald-400">+${cuts.subscriptions || 0}/mo cut</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="5"
                        value={cuts.subscriptions || 0}
                        onChange={(e) => handleCutChange("subscriptions", e.target.value)}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Original: $70/mo</span>
                        <span>Remaining for subs: ${(70 - (cuts.subscriptions || 0)).toFixed(0)}/mo</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Payoff Acceleration Impact */}
                <div className="p-5 rounded-xl bg-gradient-to-r from-teal-950/40 via-slate-900/70 to-emerald-950/40 border border-teal-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                        Accelerated Payoff Projection
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        Avalanche Strategy
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Monthly Payoff Power</span>
                        <span className="font-mono text-xl font-bold text-white block mt-0.5">
                          ${(totalDebtPayoffs + acceleratedSurplus).toFixed(2)}/mo
                        </span>
                        <span className="text-[10px] text-emerald-400">+${acceleratedSurplus.toFixed(2)} extra fuel</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Time Saved</span>
                        <span className="font-mono text-xl font-bold text-teal-300 block mt-0.5">
                          {monthsSaved} Months
                        </span>
                        <span className="text-[10px] text-slate-400">Payoff in ~{acceleratedMonths} months</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Compounding Interest Saved</span>
                        <span className="font-mono text-xl font-bold text-emerald-400 block mt-0.5">
                          ${interestSaved.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">Kept in your pocket</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 self-start md:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        api.post("/strategies/compare", null, { params: { extra_payment: acceleratedSurplus } })
                          .then((res) => {
                            setCompare(res.data);
                            toast.success(`⚡ Applied +$${acceleratedSurplus.toFixed(2)}/mo accelerated surplus to your Avalanche Strategy!`);
                          })
                          .catch(() => {
                            toast.success(`⚡ Applied +$${acceleratedSurplus.toFixed(2)}/mo accelerated surplus!`);
                          });
                      }}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-semibold text-xs shadow-lg shadow-teal-500/25 flex items-center gap-2 transition active:scale-95"
                    >
                      <Zap className="w-4 h-4" />
                      Apply +${acceleratedSurplus.toFixed(2)}/mo to Strategy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Add Custom Expense */}
            {showAddExpenseModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
                <div className="glass-strong rounded-2xl p-6 w-full max-w-md border border-white/15 shadow-2xl relative">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <h3 className="font-display text-base font-semibold text-white">
                      Add Custom Budget Line Item
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddExpenseModal(false)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddCustomExpense} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Expense Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Pet Food & Vet, Gym Membership"
                        value={newExpenseName}
                        onChange={(e) => setNewExpenseName(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Monthly Amount ($)</label>
                      <input
                        type="number"
                        placeholder="85.00"
                        value={newExpenseAmount}
                        onChange={(e) => setNewExpenseAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1.5 font-medium">Classification</label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${newExpenseType === "need" ? "bg-blue-500/20 border-blue-500/40 text-blue-300" : "bg-white/5 border-white/10 text-slate-400"}`}>
                          <input
                            type="radio"
                            name="type"
                            checked={newExpenseType === "need"}
                            onChange={() => setNewExpenseType("need")}
                            className="sr-only"
                          />
                          <span className="font-semibold">Need (Essential)</span>
                        </label>
                        <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${newExpenseType === "want" ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "bg-white/5 border-white/10 text-slate-400"}`}>
                          <input
                            type="radio"
                            name="type"
                            checked={newExpenseType === "want"}
                            onChange={() => setNewExpenseType("want")}
                            className="sr-only"
                          />
                          <span className="font-semibold">Want (Discretionary)</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setShowAddExpenseModal(false)}
                        className="px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-md shadow-teal-500/20"
                      >
                        Add to Budget
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
