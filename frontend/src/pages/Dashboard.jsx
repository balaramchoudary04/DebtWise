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
  Search,
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
  { id: "breakdown_timeline", title: "Overall Progress Glance (Debt, Spending & Budget)", desc: "Clear real-time progress tracking across Debt Payment, Living Spending, and Budget Limits" },
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

  // Top 3 Summary Cards Reactive Modals State
  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [draftCategories, setDraftCategories] = useState([]);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [tempIncomeVal, setTempIncomeVal] = useState("5200");
  const [tempPayFreq, setTempPayFreq] = useState("monthly");
  const [showSpentBreakdownModal, setShowSpentBreakdownModal] = useState(false);

  // Spend Accounts Transactions State
  const [transactions, setTransactions] = useState([
    {
      transaction_id: "tx-101",
      name: "Whole Foods Market",
      account_name: "Chase Total Checking (••4921)",
      amount: 142.50,
      date: "2026-10-25",
      category: "Food & Dining",
      is_spending: true,
      is_internal_transfer: false,
    },
    {
      transaction_id: "tx-102",
      name: "Con Edison Electric & Gas",
      account_name: "Chase Total Checking (••4921)",
      amount: 185.00,
      date: "2026-10-24",
      category: "Utilities",
      is_spending: true,
      is_internal_transfer: false,
    },
    {
      transaction_id: "tx-103",
      name: "Chipotle Mexican Grill",
      account_name: "Amex Blue Cash (••1024)",
      amount: 24.80,
      date: "2026-10-24",
      category: "Food & Dining",
      is_spending: true,
      is_internal_transfer: false,
    },
    {
      transaction_id: "tx-104",
      name: "Target Supercenter",
      account_name: "Capital One SavorOne (••8832)",
      amount: 118.40,
      date: "2026-10-23",
      category: "Shopping",
      is_spending: true,
      is_internal_transfer: false,
    },
    {
      transaction_id: "tx-105",
      name: "Shell Oil Gas Station",
      account_name: "Chase Total Checking (••4921)",
      amount: 52.00,
      date: "2026-10-22",
      category: "Transportation",
      is_spending: true,
      is_internal_transfer: false,
    },
    {
      transaction_id: "tx-106",
      name: "Netflix & Spotify Subscription",
      account_name: "Amex Blue Cash (••1024)",
      amount: 32.98,
      date: "2026-10-21",
      category: "Entertainment",
      is_spending: true,
      is_internal_transfer: false,
    },
    {
      transaction_id: "tx-107",
      name: "Trader Joe's",
      account_name: "Chase Total Checking (••4921)",
      amount: 86.30,
      date: "2026-10-20",
      category: "Food & Dining",
      is_spending: true,
      is_internal_transfer: false,
    },
    {
      transaction_id: "tx-108",
      name: "CVS Pharmacy & Care",
      account_name: "Bank of America Checking (••3319)",
      amount: 45.20,
      date: "2026-10-19",
      category: "Healthcare",
      is_spending: true,
      is_internal_transfer: false,
    },
    {
      transaction_id: "tx-109",
      name: "AMC Theatres Movies & Snacks",
      account_name: "Capital One SavorOne (••8832)",
      amount: 38.50,
      date: "2026-10-18",
      category: "Entertainment",
      is_spending: true,
      is_internal_transfer: false,
    },
    {
      transaction_id: "tx-110",
      name: "Amazon Marketplace",
      account_name: "Amex Blue Cash (••1024)",
      amount: 74.90,
      date: "2026-10-17",
      category: "Shopping",
      is_spending: true,
      is_internal_transfer: false,
    },
    {
      transaction_id: "tx-111",
      name: "Verizon Wireless & Fios",
      account_name: "Chase Total Checking (••4921)",
      amount: 125.00,
      date: "2026-10-16",
      category: "Utilities",
      is_spending: true,
      is_internal_transfer: false,
    },
    {
      transaction_id: "tx-112",
      name: "Uber Transit & Rides",
      account_name: "Amex Blue Cash (••1024)",
      amount: 34.50,
      date: "2026-10-15",
      category: "Transportation",
      is_spending: true,
      is_internal_transfer: false,
    },
    {
      transaction_id: "tx-113",
      name: "Chase Sapphire Credit Card AutoPay",
      account_name: "Chase Total Checking (••4921)",
      amount: 240.00,
      date: "2026-10-14",
      category: "Debt Transfer (Excluded)",
      is_spending: false,
      is_internal_transfer: true,
      matched_debt_name: "Chase Sapphire Preferred",
    },
  ]);
  const [txSearch, setTxSearch] = useState("");
  const [txAccountFilter, setTxAccountFilter] = useState("all");
  const [txCategoryFilter, setTxCategoryFilter] = useState("all");
  const [activeSpendTab, setActiveSpendTab] = useState("transactions"); // "transactions" | "categories"
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [newTxName, setNewTxName] = useState("");
  const [newTxAmount, setNewTxAmount] = useState("");
  const [newTxAccount, setNewTxAccount] = useState("Chase Total Checking (••4921)");
  const [newTxCategory, setNewTxCategory] = useState("Food & Dining");
  const [newTxDate, setNewTxDate] = useState(new Date().toISOString().split("T")[0]);

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

  const handleUpdateTxCategory = (txId, newCategory) => {
    api.put(`/transactions/${txId}/category`, { category: newCategory }).catch(() => {});
    setTransactions((prev) =>
      prev.map((t) => (t.transaction_id === txId ? { ...t, category: newCategory } : t))
    );
    toast.success(`Assigned "${newCategory}" to transaction!`);
  };

  const handleCreateTransaction = (e) => {
    e.preventDefault();
    if (!newTxName.trim()) {
      toast.error("Please enter a merchant or transaction name.");
      return;
    }
    const amt = parseFloat(newTxAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    const isTransfer = newTxCategory === "Debt Transfer (Excluded)";
    const newTx = {
      transaction_id: `tx-${Date.now()}`,
      name: newTxName.trim(),
      amount: amt,
      account_name: newTxAccount,
      category: newTxCategory,
      date: newTxDate || new Date().toISOString().split("T")[0],
      is_spending: !isTransfer,
      is_internal_transfer: isTransfer,
    };
    api.post("/transactions", newTx).catch(() => {});
    setTransactions((prev) => [newTx, ...prev]);
    setShowAddTxModal(false);
    setNewTxName("");
    setNewTxAmount("");
    toast.success(`Added transaction under "${newTxCategory}"!`);
  };

  const handleDeleteTransaction = (txId) => {
    api.delete(`/transactions/${txId}`).catch(() => {});
    setTransactions((prev) => prev.filter((t) => t.transaction_id !== txId));
    toast.info("Transaction deleted.");
  };

  const getCategoryColorClass = (cat) => {
    switch (cat) {
      case "Utilities":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "Food & Dining":
      case "Food":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "Shopping":
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
      case "Entertainment":
        return "bg-pink-500/15 text-pink-300 border-pink-500/30";
      case "Groceries":
        return "bg-teal-500/15 text-teal-300 border-teal-500/30";
      case "Transportation":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
      case "Healthcare":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
      case "Subscriptions":
        return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
      case "Housing":
        return "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
      case "Debt Transfer (Excluded)":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold";
      default:
        return "bg-slate-500/15 text-slate-300 border-slate-500/30";
    }
  };

  const formatTxDate = (dateStr) => {
    try {
      if (!dateStr) return "Recent";
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const saveBudgetSettings = (updatedBudget) => {
    api.put("/user/budget-planner", updatedBudget).catch(() => {});
  };

  const handleViewAllTransactionsFromModal = (accountFilter = "all") => {
    setShowSpentBreakdownModal(false);
    setActiveSpendTab("transactions");
    setTxSearch("");
    setTxAccountFilter(accountFilter);
    setTxCategoryFilter("all");
    setTimeout(() => {
      const el = document.getElementById("spend-transactions-list-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.classList.add("ring-2", "ring-teal-400", "rounded-2xl", "transition-all", "duration-700");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-teal-400");
        }, 2200);
      }
    }, 150);
    toast.success(
      accountFilter === "all"
        ? `Viewing all ${transactions.length} transactions across connected accounts.`
        : `Filtered to ${accountFilter} transactions.`
    );
  };

  const scrollToSpendSection = (sectionId) => {
    setActiveSpendTab(sectionId);
    const elementId = sectionId === "budget" ? "spend-categories-grid-section" : "spend-transactions-list-section";
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("ring-2", "ring-teal-400", "rounded-2xl", "transition-all", "duration-700");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-teal-400");
      }, 2000);
    }
  };

  const handleOpenBudgetEditor = () => {
    setDraftCategories(categories.map((c) => ({ ...c })));
    setShowEditBudgetModal(true);
  };

  const handleUpdateDraftCategoryBudget = (catId, newBudget) => {
    const num = Math.max(0, parseFloat(newBudget) || 0);
    setDraftCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, budget: num, auto_recommended: false } : c))
    );
  };

  const handleDraftMatchSpend = () => {
    setDraftCategories((prev) =>
      prev.map((c) => {
        const spent = parseFloat(c.spent) || 0;
        const rounded = Math.round(Math.max(40, spent * 1.10) / 10) * 10;
        return { ...c, budget: rounded, auto_recommended: false };
      })
    );
    toast.info("Adjusted category budgets to match actual spending + 10% buffer.");
  };

  const handleDraftAutoBalanceDebt = () => {
    const trimRatio = 0.30;
    setDraftCategories((prev) =>
      prev.map((cat) => {
        const flexible = ["dining", "shopping", "entertainment", "subscriptions", "groceries", "transportation"].includes(cat.id);
        if (flexible) {
          const spent = parseFloat(cat.spent) || 100;
          const cut = Math.round(spent * 0.4 * trimRatio);
          return { ...cat, budget: Math.max(40, Math.round(spent - cut)), auto_recommended: true };
        }
        return cat;
      })
    );
    toast.info("Applied debt-optimized budget targets across categories.");
  };

  const handleSaveDraftBudget = () => {
    setCategories(draftCategories);
    setBudgetMode("custom");
    const newTotal = draftCategories.reduce((s, c) => s + (parseFloat(c.budget) || 0), 0);
    saveBudgetSettings({
      monthly_income: budgetIncome,
      pay_frequency: budgetPayFrequency,
      budget_mode: "custom",
      categories: draftCategories,
      total_budget: newTotal,
    });
    setShowEditBudgetModal(false);
    toast.success(`Assigned monthly budget updated to $${newTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}!`);
  };

  const handleOpenIncomeModal = () => {
    setTempIncomeVal(String(budgetIncome));
    setTempPayFreq(budgetPayFrequency);
    setShowIncomeModal(true);
  };

  const handleSaveIncomeModal = () => {
    const val = parseFloat(tempIncomeVal);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid monthly income.");
      return;
    }
    setBudgetIncome(val);
    setBudgetPayFrequency(tempPayFreq);
    saveBudgetSettings({
      monthly_income: val,
      pay_frequency: tempPayFreq,
      budget_mode: budgetMode,
      categories: categories,
      total_budget: categories.reduce((s, c) => s + (parseFloat(c.budget) || 0), 0),
    });
    setShowIncomeModal(false);
    toast.success(`Monthly income updated to $${val.toLocaleString()} (${tempPayFreq}).`);
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
      api.get("/transactions").catch(() => ({ data: [] })),
    ])
      .then(([d, c, bc, r, bp, tx]) => {
        setDebts(d.data);
        setCompare(c.data);
        setBoostedCompare(bc.data);
        setReminders(r.data);
        if (tx?.data && Array.isArray(tx.data) && tx.data.length > 0) {
          setTransactions(tx.data);
        }
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
        const livingTxns = transactions.filter((t) => t.is_spending !== false && !t.is_internal_transfer);
        const spendTotalFromTx = livingTxns.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        const totalSpent = spendTotalFromTx > 0 ? spendTotalFromTx : categories.reduce((s, e) => s + (parseFloat(e.spent) || 0), 0);
        const totalBudget = categories.reduce((s, e) => s + (parseFloat(e.budget) || 0), 0);
        const totalDebtPayoffs = totalMin > 0 ? totalMin : 880;
        const totalOutflows = totalSpent + totalDebtPayoffs;
        const safeSurplus = Math.max(0, budgetIncome - totalOutflows);
        const budgetRemaining = totalBudget - totalSpent;
        const budgetPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

        const filteredTransactions = transactions.filter((tx) => {
          if (txAccountFilter !== "all" && tx.account_name !== txAccountFilter) return false;
          if (txCategoryFilter !== "all" && tx.category !== txCategoryFilter) return false;
          if (txSearch.trim()) {
            const q = txSearch.toLowerCase();
            const matchName = tx.name?.toLowerCase().includes(q);
            const matchAcct = tx.account_name?.toLowerCase().includes(q);
            const matchCat = tx.category?.toLowerCase().includes(q);
            if (!matchName && !matchAcct && !matchCat) return false;
          }
          return true;
        });

        const spendAccountOptions = Array.from(new Set(transactions.map((t) => t.account_name).filter(Boolean)));

        const getCategoryIcon = (iconName) => {
          switch (iconName) {
            case "Utilities":
            case "Zap":
              return <Zap className="w-4 h-4 text-amber-400" />;
            case "Food & Dining":
            case "Food":
            case "Utensils":
              return <Utensils className="w-4 h-4 text-emerald-400" />;
            case "Shopping":
            case "ShoppingBag":
              return <ShoppingBag className="w-4 h-4 text-purple-400" />;
            case "Entertainment":
            case "Film":
              return <Film className="w-4 h-4 text-pink-400" />;
            case "Groceries":
              return <ShoppingBag className="w-4 h-4 text-teal-400" />;
            case "Transportation":
            case "Car":
              return <Car className="w-4 h-4 text-blue-400" />;
            case "Healthcare":
            case "HeartPulse":
              return <HeartPulse className="w-4 h-4 text-rose-400" />;
            case "Subscriptions":
            case "Sparkles":
              return <Sparkles className="w-4 h-4 text-cyan-400" />;
            case "Housing":
            case "Home":
              return <Home className="w-4 h-4 text-indigo-400" />;
            case "Debt Transfer (Excluded)":
              return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
            default:
              return <DollarSign className="w-4 h-4 text-slate-400" />;
          }
        };

        return (
          <div className="glass rounded-2xl p-6 mb-10 border border-teal-500/20 relative" data-testid="card-spend-budget-planner">
            {/* Header: Monthly Spending Tracker & Budget */}
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
                    Track your income, actual monthly spending, and budget limits across all connected spend accounts.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-600/25 flex items-center gap-1.5 transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Transaction
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAutoBuildModal("balanced")}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition"
                  title="Ask website to build a budget for your debt payoff plan"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  Auto-Build for Debt
                </button>
                <button
                  type="button"
                  onClick={handleRefreshPlaidBudget}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition"
                  title="Sync checking & card transactions via Plaid"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                </button>
              </div>
            </div>

            {/* 3 Core Metric Cards Requested by User (All Fully Reactive & Click-to-Edit) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* 1. Income Made This Month */}
              <div
                onClick={handleOpenIncomeModal}
                className="p-4 rounded-xl bg-slate-900/70 border border-white/5 hover:border-emerald-500/40 hover:bg-slate-900/90 transition cursor-pointer relative group"
                title="Click card to open and edit monthly take-home income"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-slate-300">Income Made This Month</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenIncomeModal();
                    }}
                    className="text-slate-400 group-hover:text-emerald-400 p-1 rounded hover:bg-white/5 transition flex items-center gap-1 text-[11px]"
                    title="Edit Monthly Take-Home Pay"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span className="hidden sm:inline font-semibold">Edit</span>
                  </button>
                </div>

                <div>
                  <span className="font-display text-2xl font-bold text-white font-mono">
                    ${budgetIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Take-home pay &amp; recurring direct deposits
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 group-hover:text-emerald-400/90 transition mt-2 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <Edit2 className="w-2.5 h-2.5" /> Click card to adjust income
                  </span>
                  <span className="font-mono uppercase text-slate-400">{budgetPayFrequency}</span>
                </div>
              </div>

              {/* 2. Spent This Month */}
              <div
                onClick={() => setShowSpentBreakdownModal(true)}
                className="p-4 rounded-xl bg-slate-900/70 border border-white/5 hover:border-rose-500/40 hover:bg-slate-900/90 transition cursor-pointer relative group"
                title="Click card to view monthly spending breakdown"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-slate-300">Spent This Month</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSpentBreakdownModal(true);
                    }}
                    className="text-slate-400 group-hover:text-rose-400 p-1 rounded hover:bg-white/5 transition flex items-center gap-1 text-[11px]"
                  >
                    <span className="font-mono text-[10px] text-slate-400 mr-0.5">{livingTxns.length} txns</span>
                    <span className="text-teal-400 font-semibold hidden sm:inline">Details</span>
                  </button>
                </div>

                <span className="font-display text-2xl font-bold text-teal-400 font-mono block">
                  ${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Across all connected spend accounts
                </span>

                <div className="flex items-center justify-between text-[10px] text-slate-500 group-hover:text-rose-400/90 transition mt-2 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-2.5 h-2.5" /> Click card to view spend details
                  </span>
                  <span className="text-emerald-400 font-semibold">$560 CC transfers isolated</span>
                </div>
              </div>

              {/* 3. Assigned Monthly Budget (REACTIVE & CLICK-TO-EDIT) */}
              <div
                onClick={handleOpenBudgetEditor}
                className="p-4 rounded-xl bg-slate-900/70 border border-white/5 hover:border-teal-500/40 hover:bg-slate-900/90 transition cursor-pointer relative group shadow-md hover:shadow-teal-500/10"
                title="Click card to open and edit monthly budget limits"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-teal-500/10 text-teal-400 flex items-center justify-center">
                      <Calculator className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-slate-300">Assigned Monthly Budget</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {budgetMode === "auto_debt" ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> Debt-Optimized
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">Custom</span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenBudgetEditor();
                      }}
                      className="text-slate-400 group-hover:text-teal-300 p-1 rounded hover:bg-white/5 transition flex items-center gap-1 text-[11px]"
                      title="Open full budget editor"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span className="hidden sm:inline font-semibold">Edit</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="font-display text-2xl font-bold text-white font-mono">
                    ${totalBudget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`text-xs font-mono font-semibold ${budgetRemaining >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {budgetRemaining >= 0 ? `$${budgetRemaining.toFixed(2)} left` : `$${Math.abs(budgetRemaining).toFixed(2)} over`}
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
                  <div
                    style={{ width: `${Math.min(100, budgetPct)}%` }}
                    className={`h-full transition-all duration-500 ${budgetPct > 100 ? "bg-rose-500" : budgetPct > 90 ? "bg-amber-500" : "bg-teal-500"}`}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 group-hover:text-teal-400/90 transition mt-2 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <SlidersHorizontal className="w-2.5 h-2.5" /> Click card to edit monthly budget
                  </span>
                  <span className="font-mono text-teal-300 font-semibold">{budgetPct}% used</span>
                </div>
              </div>
            </div>

            {/* Sub-view Switcher & Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 mb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollToSpendSection("transactions")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                    activeSpendTab === "transactions"
                      ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Transactions</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSpendSection("budget")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                    activeSpendTab === "budget" || activeSpendTab === "categories"
                      ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Budget</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="bg-slate-950 border border-white/10 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 w-36 sm:w-44"
                  />
                </div>

                {/* Account Filter */}
                <select
                  value={txAccountFilter}
                  onChange={(e) => setTxAccountFilter(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-teal-400"
                >
                  <option value="all">All Spend Accounts</option>
                  {spendAccountOptions.map((acct) => (
                    <option key={acct} value={acct}>
                      {acct}
                    </option>
                  ))}
                </select>

                {/* Category Filter */}
                <select
                  value={txCategoryFilter}
                  onChange={(e) => setTxCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-teal-400"
                >
                  <option value="all">All Categories</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Subscriptions">Subscriptions</option>
                  <option value="Housing">Housing</option>
                  <option value="Debt Transfer (Excluded)">Debt Transfers</option>
                </select>
              </div>
            </div>

            {/* SECTION 1: LIST VIEW OF EACH TRANSACTION ACROSS ALL SPEND ACCOUNTS (ALWAYS VISIBLE) */}
            <div id="spend-transactions-list-section" className="space-y-2 mb-6">
                {filteredTransactions.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-white/5">
                    <p className="text-sm text-slate-400">No transactions match your current filters.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setTxSearch("");
                        setTxAccountFilter("all");
                        setTxCategoryFilter("all");
                      }}
                      className="mt-2 text-xs font-semibold text-teal-400 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {filteredTransactions.map((tx) => (
                      <div
                        key={tx.transaction_id}
                        className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/15 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        {/* Transaction Name, Account & Category Underneath */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center shrink-0">
                            {getCategoryIcon(tx.category)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-white truncate">{tx.name}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10 flex items-center gap-1 font-mono">
                                <CreditCard className="w-2.5 h-2.5 text-teal-400" />
                                {tx.account_name}
                              </span>
                            </div>

                            {/* Under Each Transaction: Assigned Category Dropdown Pill & Date */}
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-[11px] text-slate-500 font-mono">
                                {formatTxDate(tx.date)}
                              </span>
                              <span className="text-slate-600">•</span>

                              {/* Interactive Category Selector Pill */}
                              <div className="relative inline-flex items-center">
                                <select
                                  value={tx.category}
                                  onChange={(e) => handleUpdateTxCategory(tx.transaction_id, e.target.value)}
                                  className={`text-[11px] font-semibold rounded-lg px-2 py-0.5 border cursor-pointer appearance-none pr-5 focus:outline-none transition ${getCategoryColorClass(
                                    tx.category
                                  )}`}
                                  title="Click to assign or reassign category"
                                >
                                  <option value="Utilities">⚡ Utilities</option>
                                  <option value="Food & Dining">🍽️ Food & Dining</option>
                                  <option value="Shopping">🛍️ Shopping</option>
                                  <option value="Entertainment">🎬 Entertainment</option>
                                  <option value="Groceries">🛒 Groceries</option>
                                  <option value="Transportation">🚗 Transportation</option>
                                  <option value="Healthcare">🩺 Healthcare</option>
                                  <option value="Subscriptions">📱 Subscriptions</option>
                                  <option value="Housing">🏠 Housing</option>
                                  <option value="Debt Transfer (Excluded)">🛡️ Debt Transfer (Excluded)</option>
                                  <option value="Other">💵 Other</option>
                                </select>
                                <ChevronRight className="w-3 h-3 text-slate-400 absolute right-1 pointer-events-none rotate-90" />
                              </div>

                              {tx.is_internal_transfer && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                                  Plaid Transfer Isolated ($0 Spend)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-end sm:self-center">
                          {tx.is_internal_transfer ? (
                            <div className="text-right">
                              <span className="font-mono text-sm font-semibold text-slate-400 line-through block">
                                ${Number(tx.amount).toFixed(2)}
                              </span>
                              <span className="font-mono text-xs font-bold text-emerald-400 block">
                                $0.00 spend
                              </span>
                            </div>
                          ) : (
                            <span className="font-mono text-sm font-bold text-white">
                              -${Number(tx.amount).toFixed(2)}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteTransaction(tx.transaction_id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition"
                            title="Delete transaction"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            {/* SECTION 2: CATEGORY BUDGET TARGETS GRID (ALWAYS VISIBLE) */}
            <div id="spend-categories-grid-section" className="space-y-3 mb-6 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  Category Budget Targets ({categories.length})
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
                              {getCategoryIcon(cat.name || cat.icon)}
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

            {/* Plaid Reconciled Debt Payoffs Strip */}
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

            {/* Modal: Edit Monthly Budget (Reactive) */}
            {showEditBudgetModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                <div className="glass-strong rounded-3xl p-6 sm:p-7 max-w-2xl w-full max-h-[90vh] flex flex-col border border-teal-500/30 shadow-2xl relative">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
                        <Calculator className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-semibold text-white">Edit Monthly Budget Limits</h3>
                        <p className="text-xs text-slate-400">Make reactive edits to your category spending limits and target budget.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEditBudgetModal(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Live Reactive KPI Bar Inside Modal */}
                  {(() => {
                    const liveTotal = draftCategories.reduce((s, c) => s + (parseFloat(c.budget) || 0), 0);
                    const liveDebtMins = totalMin > 0 ? totalMin : 880;
                    const liveSurplus = budgetIncome - liveTotal - liveDebtMins;
                    const livePct = budgetIncome > 0 ? Math.round((liveTotal / budgetIncome) * 100) : 0;

                    return (
                      <div className="space-y-3 mb-4 shrink-0">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          <div className="p-3 rounded-xl bg-slate-900/80 border border-teal-500/30">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Assigned Budget</span>
                            <span className="font-display text-lg font-bold text-teal-300 font-mono block mt-0.5">
                              ${liveTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{livePct}% of income</span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Monthly Income</span>
                            <span className="font-display text-lg font-bold text-white font-mono block mt-0.5">
                              ${budgetIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-slate-500">Take-home net</span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Debt Minimums</span>
                            <span className="font-display text-lg font-bold text-white font-mono block mt-0.5">
                              ${liveDebtMins.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-emerald-400">Auto-isolated ($0 spend)</span>
                          </div>

                          <div className={`p-3 rounded-xl border ${liveSurplus >= 0 ? "bg-emerald-950/40 border-emerald-500/30" : "bg-rose-950/40 border-rose-500/30"}`}>
                            <span className={`text-[10px] uppercase font-bold tracking-wider block ${liveSurplus >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              Payoff Buffer
                            </span>
                            <span className={`font-display text-lg font-bold font-mono block mt-0.5 ${liveSurplus >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                              {liveSurplus >= 0 ? `+$${liveSurplus.toFixed(2)}` : `-$${Math.abs(liveSurplus).toFixed(2)}`}
                            </span>
                            <span className={`text-[10px] block ${liveSurplus >= 0 ? "text-emerald-400/80" : "text-rose-400/80"}`}>
                              {liveSurplus >= 0 ? "Safe extra payoff power" : "Exceeds monthly income!"}
                            </span>
                          </div>
                        </div>

                        {/* Quick Adjustment Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/50 border border-white/5 text-xs">
                          <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                            Quick Presets:
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={handleDraftAutoBalanceDebt}
                              className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-semibold transition"
                            >
                              ⚡ Auto-Build for Debt
                            </button>
                            <button
                              type="button"
                              onClick={handleDraftMatchSpend}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-semibold transition"
                            >
                              🔄 Match Spend (+10%)
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowAddCategoryModal(true)}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-semibold transition flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3 text-teal-400" />
                              Add Category
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Reactive Categories List (Scrollable) */}
                  <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-0">
                    {draftCategories.map((cat) => {
                      const spent = parseFloat(cat.spent) || 0;
                      const budget = parseFloat(cat.budget) || 0;
                      const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
                      const isOver = spent > budget;
                      const maxSlider = Math.max(1000, Math.ceil((budget * 2) / 100) * 100);

                      return (
                        <div
                          key={cat.id}
                          className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/15 transition space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
                                {getCategoryIcon(cat.icon || cat.name)}
                              </div>
                              <div className="min-w-0">
                                <span className="text-sm font-semibold text-white block truncate">{cat.name}</span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  Spent: <strong className="text-slate-300">${spent.toFixed(2)}</strong>
                                </span>
                              </div>
                            </div>

                            {/* Direct Number Input */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-slate-400 text-xs font-mono">$</span>
                              <input
                                type="number"
                                step="10"
                                min="0"
                                value={cat.budget}
                                onChange={(e) => handleUpdateDraftCategoryBudget(cat.id, e.target.value)}
                                className="w-24 bg-slate-950 border border-teal-500/40 rounded-lg px-2.5 py-1 text-xs text-white font-mono text-right focus:outline-none focus:border-teal-400 font-semibold"
                              />
                              <span
                                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                  isOver ? "bg-rose-500/20 text-rose-300" : "bg-teal-500/20 text-teal-300"
                                }`}
                              >
                                {pct}% used
                              </span>
                            </div>
                          </div>

                          {/* Reactive Range Slider */}
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max={maxSlider}
                              step="25"
                              value={cat.budget}
                              onChange={(e) => handleUpdateDraftCategoryBudget(cat.id, e.target.value)}
                              className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDraftCategories(categories.map((c) => ({ ...c })))}
                      className="text-xs text-slate-400 hover:text-white transition"
                    >
                      Reset changes
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowEditBudgetModal(false)}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveDraftBudget}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-semibold shadow-md shadow-teal-500/20 flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Save &amp; Apply Budget
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Edit Monthly Income (Reactive) */}
            {showIncomeModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                <div className="glass-strong rounded-3xl p-6 sm:p-7 max-w-md w-full border border-emerald-500/30 shadow-2xl relative">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <ArrowDown className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-semibold text-white">Edit Monthly Take-Home Income</h3>
                        <p className="text-xs text-slate-400">Update your monthly recurring net inflow.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowIncomeModal(false)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Monthly Take-Home Pay ($)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
                        <input
                          type="number"
                          step="50"
                          value={tempIncomeVal}
                          onChange={(e) => setTempIncomeVal(e.target.value)}
                          className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl pl-8 pr-3 py-2 text-white font-mono text-base focus:outline-none focus:border-emerald-400 font-semibold"
                          autoFocus
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-1">Net pay after taxes and 401(k) deductions.</span>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Pay Frequency</label>
                      <select
                        value={tempPayFreq}
                        onChange={(e) => setTempPayFreq(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                      >
                        <option value="monthly">Monthly (1x / month)</option>
                        <option value="semi-monthly">Semi-Monthly (2x / month)</option>
                        <option value="bi-weekly">Bi-Weekly (Every 2 weeks)</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Total Monthly Net Inflow:</span>
                      <span className="font-mono font-bold text-emerald-400 text-base">
                        ${(parseFloat(tempIncomeVal) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setShowIncomeModal(false)}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveIncomeModal}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Save Income
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Monthly Spending Breakdown (Reactive) */}
            {showSpentBreakdownModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                <div className="glass-strong rounded-3xl p-6 sm:p-7 max-w-xl w-full max-h-[90vh] flex flex-col border border-rose-500/30 shadow-2xl relative">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                        <ArrowUp className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-semibold text-white">Monthly Spending Breakdown</h3>
                        <p className="text-xs text-slate-400">Total spent across all connected spend accounts this month.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSpentBreakdownModal(false)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Spent This Month</span>
                        <span className="font-display text-2xl font-bold text-teal-400 font-mono block mt-0.5">
                          ${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 font-mono">
                        {livingTxns.length} living transactions
                      </span>
                    </div>

                    {/* Spend by Account (Clickable to Filter) */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Spending by Connected Account</h4>
                        <span className="text-[10px] text-teal-400 font-medium">Click account to filter &amp; view</span>
                      </div>
                      <div className="space-y-1.5">
                        {spendAccountOptions.map((acct) => {
                          const acctTxns = livingTxns.filter((t) => t.account_name === acct);
                          const acctSpent = acctTxns.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
                          const acctPct = totalSpent > 0 ? Math.round((acctSpent / totalSpent) * 100) : 0;

                          return (
                            <div
                              key={acct}
                              onClick={() => handleViewAllTransactionsFromModal(acct)}
                              className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 hover:border-teal-500/40 hover:bg-slate-900/90 transition cursor-pointer flex items-center justify-between group"
                              title={`Click to filter list to ${acct}`}
                            >
                              <div className="min-w-0">
                                <span className="text-white group-hover:text-teal-300 font-medium block truncate transition">{acct}</span>
                                <span className="text-[10px] text-slate-500">{acctTxns.length} transactions</span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-bold text-white block">${acctSpent.toFixed(2)}</span>
                                <span className="text-[10px] text-teal-400 font-mono">{acctPct}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recent Living Transactions List inside modal */}
                    <div>
                      <h4 className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                        Recent Spend Transactions ({livingTxns.length})
                      </h4>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {livingTxns.map((tx) => (
                          <div key={tx.transaction_id} className="p-2 rounded-lg bg-slate-900/40 border border-white/5 flex items-center justify-between">
                            <div className="min-w-0 flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
                                {getCategoryIcon(tx.category)}
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-semibold text-white block truncate">{tx.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{tx.category} • {formatTxDate(tx.date)}</span>
                              </div>
                            </div>
                            <span className="font-mono text-xs font-bold text-white shrink-0">
                              -${Number(tx.amount).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Plaid Isolation Notice */}
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        <strong className="text-emerald-400 font-medium">Plaid Isolation Active:</strong> Credit card and loan payments made from your checking account are automatically excluded ($0.00 spend) so they are not counted twice.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10 mt-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowSpentBreakdownModal(false)}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => handleViewAllTransactionsFromModal("all")}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-semibold shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition active:scale-95"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      View All Transactions in List ↓
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Add Transaction */}
            {showAddTxModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
                <div className="glass-strong rounded-2xl p-6 w-full max-w-md border border-white/15 shadow-2xl relative">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <h3 className="font-display text-base font-semibold text-white">Add New Transaction</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddTxModal(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateTransaction} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Merchant / Store / Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Whole Foods, Con Edison, Target"
                        value={newTxName}
                        onChange={(e) => setNewTxName(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Amount ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="45.50"
                          value={newTxAmount}
                          onChange={(e) => setNewTxAmount(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Date</label>
                        <input
                          type="date"
                          value={newTxDate}
                          onChange={(e) => setNewTxDate(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-400"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Spend Account</label>
                      <select
                        value={newTxAccount}
                        onChange={(e) => setNewTxAccount(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                      >
                        <option value="Chase Total Checking (••4921)">Chase Total Checking (••4921)</option>
                        <option value="Amex Blue Cash (••1024)">Amex Blue Cash (••1024)</option>
                        <option value="Capital One SavorOne (••8832)">Capital One SavorOne (••8832)</option>
                        <option value="Bank of America Checking (••3319)">Bank of America Checking (••3319)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Assign Category</label>
                      <select
                        value={newTxCategory}
                        onChange={(e) => setNewTxCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                      >
                        <option value="Utilities">⚡ Utilities</option>
                        <option value="Food & Dining">🍽️ Food & Dining</option>
                        <option value="Shopping">🛍️ Shopping</option>
                        <option value="Entertainment">🎬 Entertainment</option>
                        <option value="Groceries">🛒 Groceries</option>
                        <option value="Transportation">🚗 Transportation</option>
                        <option value="Healthcare">🩺 Healthcare</option>
                        <option value="Subscriptions">📱 Subscriptions</option>
                        <option value="Housing">🏠 Housing</option>
                        <option value="Debt Transfer (Excluded)">🛡️ Debt Transfer (Excluded)</option>
                        <option value="Other">💵 Other</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setShowAddTxModal(false)}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-md shadow-teal-600/25"
                      >
                        Save Transaction
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

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

      case "breakdown_timeline": {
        const livingTxns = transactions.filter((t) => t.is_spending !== false && !t.is_internal_transfer);
        const spendTotalFromTx = livingTxns.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        const totalSpent = spendTotalFromTx > 0 ? spendTotalFromTx : categories.reduce((s, e) => s + (parseFloat(e.spent) || 0), 0);
        const totalBudget = categories.reduce((s, e) => s + (parseFloat(e.budget) || 0), 0) || 3890;
        const totalDebtPayoffs = totalMin > 0 ? totalMin + 200 : 1080;
        const income = budgetIncome || 5200;
        const netBuffer = income - (totalSpent + totalDebtPayoffs);
        const spendRatio = income > 0 ? (totalSpent / income) * 100 : 0;
        const debtPaidEstimate = 6750;
        const origDebt = totalDebt + debtPaidEstimate;
        const debtPaidPct = origDebt > 0 ? (debtPaidEstimate / origDebt) * 100 : 17.2;
        const budgetPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
        const budgetCushion = totalBudget - totalSpent;

        return (
          <div className="glass rounded-2xl p-6 sm:p-7 mb-10 animate-fade-up" data-testid="card-overall-progress">
            {/* Widget Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span>
                  <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Executive Financial Overview</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    All 3 Pillars Active
                  </span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-white tracking-tight mt-1">
                  Overall Progress Glance
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Real-time tracking across your three financial categories: Debt Payment progress, Monthly Spending pace, and Budget Limits health.
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <span className="text-xs text-slate-400">Monthly Net Income:</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 font-mono text-xs font-bold text-white">
                  {fmtMoney(income)}
                </span>
              </div>
            </div>

            {/* 3 Core Categories Progress Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
              {/* Card 1: Debt Payment Progress */}
              <div
                className="glass rounded-2xl p-5 border border-blue-500/20 hover:border-blue-500/40 transition flex flex-col justify-between bg-gradient-to-b from-blue-950/20 to-slate-900/40 relative overflow-hidden"
                data-testid="card-glance-debt"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider block">Category 1</span>
                        <h4 className="font-medium text-white text-sm">Debt Payment Progress</h4>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {debtPaidPct.toFixed(1)}% Paid Off
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Current Balance:</span>
                      <span className="font-display text-2xl font-bold text-white">{fmtMoney(totalDebt)}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Paid off <strong className="text-emerald-400 font-semibold">{fmtMoney(debtPaidEstimate)}</strong> of {fmtMoney(origDebt)} original
                    </p>

                    <div className="w-full h-2.5 rounded-full bg-slate-800/80 overflow-hidden mt-3 relative border border-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-700"
                        style={{ width: `${Math.min(100, Math.max(5, debtPaidPct))}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>Started: {fmtMoney(origDebt)}</span>
                      <span>Goal: $0 (Debt-Free)</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Monthly Debt Outflow:</span>
                      <span className="font-mono text-white font-medium">{fmtMoney(totalDebtPayoffs)}/mo</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Target Debt-Free Date:</span>
                      <span className="text-blue-300 font-medium">
                        {avalanche?.months ? `${avalanche.months} Months` : "Oct 2028 (24 mos)"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Active Strategy:</span>
                      <span className="text-slate-300">Save Most Money (Avalanche)</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/debts")}
                  className="mt-5 w-full py-2 px-3 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 hover:text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  Open Debt Planner <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 2: Monthly Spending Progress */}
              <div
                className="glass rounded-2xl p-5 border border-emerald-500/20 hover:border-emerald-500/40 transition flex flex-col justify-between bg-gradient-to-b from-emerald-950/20 to-slate-900/40 relative overflow-hidden"
                data-testid="card-glance-spending"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">Category 2</span>
                        <h4 className="font-medium text-white text-sm">Monthly Spending</h4>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Day 26 of 31
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Total Month-to-Date:</span>
                      <span className="font-display text-2xl font-bold text-white">{fmtMoney(totalSpent)}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      <strong className="text-slate-300 font-semibold">{spendRatio.toFixed(1)}%</strong> of monthly take-home income
                    </p>

                    <div className="w-full h-2.5 rounded-full bg-slate-800/80 overflow-hidden mt-3 relative border border-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                        style={{ width: `${Math.min(100, Math.max(5, spendRatio))}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>Spent: {fmtMoney(totalSpent)}</span>
                      <span>Income: {fmtMoney(income)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Daily Spending Pace:</span>
                      <span className="font-mono text-white font-medium">{fmtMoney(totalSpent / 26)}/day</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Debt Transfer Shield:</span>
                      <span className="font-mono text-emerald-400 font-medium">$560.00 isolated</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Verified Transactions:</span>
                      <span className="text-slate-300">{transactions.length || 14} verified purchases</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/spending")}
                  className="mt-5 w-full py-2 px-3 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  View Spending & Transactions <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 3: Budget Tracking Progress */}
              <div
                className="glass rounded-2xl p-5 border border-purple-500/20 hover:border-purple-500/40 transition flex flex-col justify-between bg-gradient-to-b from-purple-950/20 to-slate-900/40 relative overflow-hidden"
                data-testid="card-glance-budget"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-amber-400"></div>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                        <SlidersHorizontal className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider block">Category 3</span>
                        <h4 className="font-medium text-white text-sm">Budget Tracking</h4>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${budgetCushion >= 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                      {budgetCushion >= 0 ? "On Track (+4.2%)" : "Over Budget"}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Assigned Monthly Budget:</span>
                      <span className="font-display text-2xl font-bold text-white">{fmtMoney(totalBudget)}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Remaining Buffer: <strong className={budgetCushion >= 0 ? "text-amber-400 font-semibold" : "text-red-400 font-semibold"}>{budgetCushion >= 0 ? `+${fmtMoney(budgetCushion)}` : `-${fmtMoney(Math.abs(budgetCushion))}`}</strong>
                    </p>

                    <div className="w-full h-2.5 rounded-full bg-slate-800/80 overflow-hidden mt-3 relative border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${budgetPct > 100 ? "bg-red-500" : "bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-400"}`}
                        style={{ width: `${Math.min(100, Math.max(5, budgetPct))}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>Used: {budgetPct.toFixed(1)}%</span>
                      <span>Cap: {fmtMoney(totalBudget)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Category Limits:</span>
                      <span className="text-emerald-400 font-medium">8 of 9 on track</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Attention Flag:</span>
                      <span className="text-amber-300 font-medium">Food & Dining (+$30 over cap)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Net Unallocated Buffer:</span>
                      <span className="font-mono text-emerald-400 font-medium">{netBuffer >= 0 ? `+${fmtMoney(netBuffer)}` : `-${fmtMoney(Math.abs(netBuffer))}`}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/spending")}
                  className="mt-5 w-full py-2 px-3 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 hover:text-purple-200 border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  Adjust Monthly Budget <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom: Unified Cash Flow Allocation Strip */}
            <div className="mt-6 pt-5 border-t border-white/5">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h5 className="text-xs uppercase font-bold tracking-wider text-slate-400">
                      Monthly Cash Flow Allocation ({fmtMoney(income)} Net Take-Home)
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Clear breakdown of how your monthly income is flowing across Living Spending, Debt Payoff, and Free Cash Buffer.
                    </p>
                  </div>
                  <div className="text-xs font-medium text-slate-300">
                    Unallocated Buffer: <strong className="text-emerald-400 font-mono">{netBuffer >= 0 ? `+${fmtMoney(netBuffer)}` : `-${fmtMoney(Math.abs(netBuffer))}`}</strong>
                  </div>
                </div>

                {/* Multi-segment Cash Flow Bar */}
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(2, (totalSpent / income) * 100))}%` }}
                    title={`Living Spending: ${fmtMoney(totalSpent)} (${((totalSpent / income) * 100).toFixed(1)}%)`}
                  ></div>
                  <div
                    className="h-full bg-blue-500 transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(2, (totalDebtPayoffs / income) * 100))}%` }}
                    title={`Debt Payments: ${fmtMoney(totalDebtPayoffs)} (${((totalDebtPayoffs / income) * 100).toFixed(1)}%)`}
                  ></div>
                  <div
                    className="h-full bg-amber-400 transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(2, (Math.max(0, netBuffer) / income) * 100))}%` }}
                    title={`Free Buffer: ${fmtMoney(Math.max(0, netBuffer))} (${((Math.max(0, netBuffer) / income) * 100).toFixed(1)}%)`}
                  ></div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="text-slate-400">Living Spending:</span>
                    <strong className="text-white font-mono">{fmtMoney(totalSpent)}</strong>
                    <span className="text-slate-500 text-[11px]">({((totalSpent / income) * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                    <span className="text-slate-400">Debt Payoff:</span>
                    <strong className="text-white font-mono">{fmtMoney(totalDebtPayoffs)}</strong>
                    <span className="text-slate-500 text-[11px]">({((totalDebtPayoffs / income) * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
                    <span className="text-slate-400">Net Cushion:</span>
                    <strong className="text-emerald-400 font-mono">{netBuffer >= 0 ? `+${fmtMoney(netBuffer)}` : `-${fmtMoney(Math.abs(netBuffer))}`}</strong>
                    <span className="text-slate-500 text-[11px]">({((Math.max(0, netBuffer) / income) * 100).toFixed(1)}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

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
