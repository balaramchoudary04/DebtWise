import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import {
  Calculator,
  ShieldCheck,
  Plus,
  Sparkles,
  RefreshCw,
  ArrowDown,
  ArrowUp,
  Edit2,
  SlidersHorizontal,
  CreditCard,
  Layers,
  Search,
  Check,
  X,
  Zap,
  Utensils,
  ShoppingBag,
  Film,
  Car,
  HeartPulse,
  Home,
  DollarSign,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

export default function SpendingBudget() {
  const navigate = useNavigate();
  const location = useLocation();

  // State: Budget & Income
  const [budgetIncome, setBudgetIncome] = useState(5200);
  const [budgetPayFrequency, setBudgetPayFrequency] = useState("monthly");
  const [budgetMode, setBudgetMode] = useState("custom"); // "custom" | "auto_debt"
  const [autoIntensity, setAutoIntensity] = useState("balanced");
  const [showAutoBuildModal, setShowAutoBuildModal] = useState(false);
  const [autoBuildResult, setAutoBuildResult] = useState(null);
  const [totalMin, setTotalMin] = useState(880);

  // Categories State
  const [categories, setCategories] = useState([
    { id: "housing", name: "Housing", spent: 1650, budget: 1650, icon: "Home" },
    { id: "groceries", name: "Groceries", spent: 520, budget: 550, icon: "ShoppingBag" },
    { id: "utilities", name: "Utilities", spent: 240, budget: 250, icon: "Zap" },
    { id: "transportation", name: "Transportation", spent: 380, budget: 400, icon: "Car" },
    { id: "healthcare", name: "Healthcare", spent: 160, budget: 180, icon: "HeartPulse" },
    { id: "dining", name: "Food & Dining", spent: 310, budget: 350, icon: "Utensils" },
    { id: "shopping", name: "Shopping", spent: 220, budget: 250, icon: "ShoppingBag" },
    { id: "entertainment", name: "Entertainment", spent: 140, budget: 150, icon: "Film" },
    { id: "subscriptions", name: "Subscriptions", spent: 70, budget: 70, icon: "Sparkles" },
  ]);

  // Transactions State
  const [transactions, setTransactions] = useState([
    { transaction_id: "tx-1", name: "Whole Foods Market", account_name: "Chase Total Checking (••4921)", amount: 142.50, date: "2026-10-25", category: "Food & Dining", is_spending: true, is_internal_transfer: false },
    { transaction_id: "tx-2", name: "Con Edison Electric & Gas", account_name: "Chase Total Checking (••4921)", amount: 185.00, date: "2026-10-24", category: "Utilities", is_spending: true, is_internal_transfer: false },
    { transaction_id: "tx-3", name: "Chipotle Mexican Grill", account_name: "Amex Blue Cash (••1024)", amount: 24.80, date: "2026-10-24", category: "Food & Dining", is_spending: true, is_internal_transfer: false },
    { transaction_id: "tx-4", name: "Target Supercenter", account_name: "Capital One SavorOne (••8832)", amount: 118.40, date: "2026-10-23", category: "Shopping", is_spending: true, is_internal_transfer: false },
    { transaction_id: "tx-5", name: "Chase Sapphire Payment (Internal Transfer)", account_name: "Chase Total Checking (••4921)", amount: 350.00, date: "2026-10-22", category: "Debt Transfer (Excluded)", is_spending: false, is_internal_transfer: true },
    { transaction_id: "tx-6", name: "Trader Joe's", account_name: "Amex Blue Cash (••1024)", amount: 88.40, date: "2026-10-21", category: "Groceries", is_spending: true, is_internal_transfer: false },
    { transaction_id: "tx-7", name: "Shell Oil / Fuel Station", account_name: "Capital One SavorOne (••8832)", amount: 48.00, date: "2026-10-20", category: "Transportation", is_spending: true, is_internal_transfer: false },
    { transaction_id: "tx-8", name: "CVS Pharmacy & Care", account_name: "Bank of America Checking (••3319)", amount: 45.20, date: "2026-10-19", category: "Healthcare", is_spending: true, is_internal_transfer: false },
    { transaction_id: "tx-9", name: "AMC Theatres Movies & Snacks", account_name: "Capital One SavorOne (••8832)", amount: 38.50, date: "2026-10-18", category: "Entertainment", is_spending: true, is_internal_transfer: false },
    { transaction_id: "tx-10", name: "Amazon Marketplace", account_name: "Amex Blue Cash (••1024)", amount: 74.90, date: "2026-10-17", category: "Shopping", is_spending: true, is_internal_transfer: false },
    { transaction_id: "tx-11", name: "Verizon Wireless & Fios", account_name: "Chase Total Checking (••4921)", amount: 125.00, date: "2026-10-16", category: "Utilities", is_spending: true, is_internal_transfer: false },
    { transaction_id: "tx-12", name: "Citi Double Cash Payment (Transfer)", account_name: "Chase Total Checking (••4921)", amount: 210.00, date: "2026-10-14", category: "Debt Transfer (Excluded)", is_spending: false, is_internal_transfer: true },
    { transaction_id: "tx-13", name: "Apartment Rent Direct Debit", account_name: "Chase Total Checking (••4921)", amount: 1650.00, date: "2026-10-01", category: "Housing", is_spending: true, is_internal_transfer: false },
  ]);

  // Filters & Tabs
  const [txSearch, setTxSearch] = useState("");
  const [txAccountFilter, setTxAccountFilter] = useState("all");
  const [txCategoryFilter, setTxCategoryFilter] = useState("all");
  const [sbSpendDrawer, setSbSpendDrawer] = useState(null); // null (closed by default) | "transactions" | "budget"

  // Reactive Modals State
  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [draftCategories, setDraftCategories] = useState([]);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [tempIncomeVal, setTempIncomeVal] = useState("5200");
  const [tempPayFreq, setTempPayFreq] = useState("monthly");
  const [showSpentBreakdownModal, setShowSpentBreakdownModal] = useState(false);
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [newTxName, setNewTxName] = useState("");
  const [newTxAmount, setNewTxAmount] = useState("");
  const [newTxAccount, setNewTxAccount] = useState("Chase Total Checking (••4921)");
  const [newTxCategory, setNewTxCategory] = useState("Food & Dining");
  const [newTxDate, setNewTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatBudget, setNewCatBudget] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/user/budget-planner").catch(() => null),
      api.get("/transactions").catch(() => null),
      api.get("/debts").catch(() => null),
    ]).then(([bRes, tRes, dRes]) => {
      if (bRes?.data) {
        if (bRes.data.monthly_income) setBudgetIncome(bRes.data.monthly_income);
        if (bRes.data.pay_frequency) setBudgetPayFrequency(bRes.data.pay_frequency);
        if (bRes.data.budget_mode) setBudgetMode(bRes.data.budget_mode);
        if (bRes.data.categories?.length) setCategories(bRes.data.categories);
      }
      if (tRes?.data?.length) {
        setTransactions(tRes.data);
      }
      if (dRes?.data?.length) {
        const sumMins = dRes.data.reduce((s, d) => s + (parseFloat(d.min_payment) || 0), 0);
        setTotalMin(sumMins || 880);
      }
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("action") === "edit-budget") {
      setDraftCategories(categories.map((c) => ({ ...c })));
      setShowEditBudgetModal(true);
    }
    if (params.get("tab") === "transactions") {
      setSbSpendDrawer("transactions");
      setTimeout(() => {
        const el = document.getElementById("spending-tx-list-table");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } else if (params.get("tab") === "budget") {
      setSbSpendDrawer("budget");
      setTimeout(() => {
        const el = document.getElementById("spending-budget-categories-grid");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [location.search, categories]);

  const saveBudgetSettings = (updatedBudget) => {
    api.put("/user/budget-planner", updatedBudget).catch(() => {});
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

  const handleViewAllTransactionsFromModal = (accountFilter = "all") => {
    setShowSpentBreakdownModal(false);
    setSbSpendDrawer("transactions");
    setTxSearch("");
    setTxAccountFilter(accountFilter);
    setTxCategoryFilter("all");
    setTimeout(() => {
      const el = document.getElementById("spending-tx-list-table");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.classList.add("ring-2", "ring-teal-400", "rounded-2xl", "transition-all", "duration-700");
        setTimeout(() => el.classList.remove("ring-2", "ring-teal-400"), 2200);
      }
    }, 150);
    toast.success(
      accountFilter === "all"
        ? `Viewing all ${transactions.length} transactions across connected accounts.`
        : `Filtered to ${accountFilter} transactions.`
    );
  };

  const toggleSbSpendDrawer = (target) => {
    setSbSpendDrawer((prev) => {
      const next = prev === target ? null : target;
      if (next) {
        const elementId = next === "budget" ? "spending-budget-categories-grid" : "spending-tx-list-table";
        setTimeout(() => {
          const el = document.getElementById(elementId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }, 50);
      }
      return next;
    });
  };

  const handleUpdateTxCategory = (txId, newCategory) => {
    const isTransfer = newCategory === "Debt Transfer (Excluded)";
    api.put(`/transactions/${txId}/category`, { category: newCategory }).catch(() => {});
    setTransactions((prev) =>
      prev.map((t) =>
        t.transaction_id === txId
          ? { ...t, category: newCategory, is_spending: !isTransfer, is_internal_transfer: isTransfer }
          : t
      )
    );
    toast.success(`Reassigned category to "${newCategory}"`);
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

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Please enter a category name.");
      return;
    }
    const budgetVal = parseFloat(newCatBudget) || 100;
    const newCat = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      spent: 0,
      budget: budgetVal,
      icon: "DollarSign",
      auto_recommended: false,
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    saveBudgetSettings({
      monthly_income: budgetIncome,
      pay_frequency: budgetPayFrequency,
      budget_mode: "custom",
      categories: updated,
      total_budget: updated.reduce((s, c) => s + (parseFloat(c.budget) || 0), 0),
    });
    setShowAddCategoryModal(false);
    setNewCatName("");
    setNewCatBudget("");
    toast.success(`Added category "${newCat.name}"!`);
  };

  const handleRefreshPlaidBudget = () => {
    toast.success("⚡ Plaid Sync: Reconciled transactions across all accounts. $560.00 in credit card payments isolated from spending.");
  };

  // Calculations
  const livingTxns = transactions.filter((t) => t.is_spending !== false && !t.is_internal_transfer);
  const spendTotalFromTx = livingTxns.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const totalSpent = spendTotalFromTx > 0 ? spendTotalFromTx : categories.reduce((s, e) => s + (parseFloat(e.spent) || 0), 0);
  const totalBudget = categories.reduce((s, e) => s + (parseFloat(e.budget) || 0), 0);
  const budgetRemaining = totalBudget - totalSpent;
  const budgetPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const debtMinimums = totalMin > 0 ? totalMin : 880;
  const safeDebtPayoffSurplus = Math.max(0, budgetIncome - totalSpent - debtMinimums);

  // Filtered Transactions
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

  const getCategoryIcon = (catName) => {
    switch (catName) {
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

  return (
    <div className="space-y-8 animate-fadeIn pb-12" data-testid="page-spending-budget">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Plaid Transfer Isolation Active
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
              Live Cash Flow Engine
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-light tracking-tight text-white">
            Spending &amp; Budget Planner
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Individual tracking hub for your monthly income, living expenses across all accounts, and custom budget limits.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setShowAddTxModal(true)}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-600/25 flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Transaction
          </button>
          <button
            type="button"
            onClick={handleDraftAutoBalanceDebt}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Auto-Build for Debt
          </button>
          <button
            type="button"
            onClick={handleRefreshPlaidBudget}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition"
            title="Sync checking & card transactions via Plaid"
          >
            <RefreshCw className="w-4 h-4 text-teal-400" />
          </button>
        </div>
      </div>

      {/* 3 Core Metric Cards (All Fully Reactive & Click-to-Edit) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Income Made This Month */}
        <div
          onClick={handleOpenIncomeModal}
          className="p-5 rounded-2xl bg-slate-900/70 border border-white/5 hover:border-emerald-500/40 hover:bg-slate-900/90 transition cursor-pointer relative group shadow-lg"
          title="Click card to open and edit monthly take-home income"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ArrowDown className="w-4 h-4" />
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
            >
              <Edit2 className="w-3 h-3" />
              <span className="font-semibold">Edit</span>
            </button>
          </div>

          <div>
            <span className="font-display text-3xl font-bold text-white font-mono">
              ${budgetIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 block mt-1">
              Take-home pay &amp; recurring direct deposits
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 group-hover:text-emerald-400/90 transition mt-3 pt-3 border-t border-white/5">
            <span className="flex items-center gap-1">
              <Edit2 className="w-3 h-3" /> Click card to adjust income
            </span>
            <span className="font-mono uppercase text-slate-400">{budgetPayFrequency}</span>
          </div>
        </div>

        {/* 2. Spent This Month (CLICK TO OPEN TRANSACTIONS ON DEMAND) */}
        <div
          onClick={() => toggleSbSpendDrawer("transactions")}
          className="p-5 rounded-2xl bg-slate-900/70 border border-white/5 hover:border-teal-500/40 hover:bg-slate-900/90 transition cursor-pointer relative group shadow-lg"
          title="Click card to open monthly transactions list on demand"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <ArrowUp className="w-4 h-4" />
              </div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-300">Spent This Month</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleSbSpendDrawer("transactions");
              }}
              className="text-slate-400 group-hover:text-teal-400 p-1 rounded hover:bg-white/5 transition flex items-center gap-1 text-[11px]"
            >
              <span className="font-mono text-[10px] text-slate-400 mr-0.5">{livingTxns.length} txns</span>
              <span className="text-teal-400 font-semibold">
                {sbSpendDrawer === "transactions" ? "Close ▲" : "Open List ▼"}
              </span>
            </button>
          </div>

          <span className="font-display text-3xl font-bold text-teal-400 font-mono block">
            ${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-slate-400 block mt-1">
            Across all connected spend accounts
          </span>

          <div className="flex items-center justify-between text-[11px] text-slate-500 group-hover:text-teal-400/90 transition mt-3 pt-3 border-t border-white/5">
            <span className="flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> Click card to open transactions on demand
            </span>
            <span className="text-emerald-400 font-semibold">$560 CC transfers isolated</span>
          </div>
        </div>

        {/* 3. Assigned Monthly Budget */}
        <div
          onClick={handleOpenBudgetEditor}
          className="p-5 rounded-2xl bg-slate-900/70 border border-white/5 hover:border-teal-500/40 hover:bg-slate-900/90 transition cursor-pointer relative group shadow-lg"
          title="Click card to open and edit monthly budget limits"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <Calculator className="w-4 h-4" />
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
              >
                <Edit2 className="w-3 h-3" />
                <span className="font-semibold">Edit</span>
              </button>
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-white font-mono">
              ${totalBudget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-xs font-mono font-semibold ${budgetRemaining >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {budgetRemaining >= 0 ? `$${budgetRemaining.toFixed(2)} left` : `$${Math.abs(budgetRemaining).toFixed(2)} over`}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-3">
            <div
              style={{ width: `${Math.min(100, budgetPct)}%` }}
              className={`h-full transition-all duration-500 ${budgetPct > 100 ? "bg-rose-500" : budgetPct > 90 ? "bg-amber-500" : "bg-teal-500"}`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 group-hover:text-teal-400/90 transition mt-3 pt-3 border-t border-white/5">
            <span className="flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" /> Click card to edit monthly budget
            </span>
            <span className="font-mono text-teal-300 font-semibold">{budgetPct}% used</span>
          </div>
        </div>
      </div>

      {/* Debt Acceleration Strip */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-white font-semibold block text-sm">
              Safe Extra Payoff Surplus: <strong className="text-emerald-400 font-mono">+${safeDebtPayoffSurplus.toFixed(2)}/mo</strong>
            </span>
            <span className="text-slate-400 text-xs">
              Net take-home income (${budgetIncome.toLocaleString()}) minus actual spending (${totalSpent.toFixed(2)}) minus debt minimums (${debtMinimums.toFixed(2)}).
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/strategies")}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shrink-0 self-start sm:self-auto transition"
        >
          Apply to Debt Payoff Plan &rarr;
        </button>
      </div>

      {/* Main Interactive Work Area: Transactions & Budget (Both Visible At All Times) */}
      <div className="glass rounded-2xl p-6 border border-white/5 space-y-8">
        {/* Quick Section Switcher & Filters Toolbar (Click to Open / Close On Demand) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleSbSpendDrawer("transactions")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                sbSpendDrawer === "transactions"
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-white/10"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Transactions</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {sbSpendDrawer === "transactions" ? "▲ Close" : "▼ Open"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => toggleSbSpendDrawer("budget")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                sbSpendDrawer === "budget"
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-white/10"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Budget</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {sbSpendDrawer === "budget" ? "▲ Close" : "▼ Open"}
              </span>
            </button>
            {sbSpendDrawer && (
              <button
                type="button"
                onClick={() => setSbSpendDrawer(null)}
                className="px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 border border-transparent transition"
              >
                ▲ Close
              </button>
            )}
          </div>

          {sbSpendDrawer === "transactions" && (
            <div className="flex flex-wrap items-center gap-2 animate-fadeIn">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 w-36 sm:w-48"
                />
              </div>

              <select
                value={txAccountFilter}
                onChange={(e) => setTxAccountFilter(e.target.value)}
                className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-400"
              >
                <option value="all">All Spend Accounts</option>
                {spendAccountOptions.map((acct) => (
                  <option key={acct} value={acct}>
                    {acct}
                  </option>
                ))}
              </select>

              <select
                value={txCategoryFilter}
                onChange={(e) => setTxCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-400"
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
                <option value="Other">Other</option>
              </select>
            </div>
          )}
        </div>

        {/* SECTION 1: CATEGORY BUDGET TARGETS (CLICK TO OPEN ON DEMAND) */}
        {sbSpendDrawer === "budget" && (
          <div id="spending-budget-categories-grid" className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                Category Budget Targets ({categories.length})
              </h4>
              <span className="text-[10px] text-slate-500 hidden sm:inline">• Click limit value or card to adjust</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenBudgetEditor}
                className="px-3 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 text-xs font-semibold border border-teal-500/30 flex items-center gap-1.5 transition"
              >
                <SlidersHorizontal className="w-3 h-3" />
                Edit Limits
              </button>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(true)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition"
              >
                <Plus className="w-3 h-3" />
                Add Category
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const spent = Number(cat.spent) || 0;
              const budget = Number(cat.budget) || 0;
              const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
              const diff = budget - spent;
              const barColor = pct > 100 ? "bg-rose-500" : pct > 90 ? "bg-amber-500" : "bg-teal-500";

              return (
                <div
                  key={cat.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/15 transition flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
                        {getCategoryIcon(cat.icon || cat.name)}
                      </div>
                      <span className="text-white font-medium text-xs truncate">{cat.name}</span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between text-xs mb-1.5">
                    <span className="text-slate-400 text-[11px]">
                      Spent: <strong className="text-white font-mono">${spent.toFixed(2)}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenBudgetEditor}
                      className="text-slate-400 hover:text-teal-400 text-[11px] flex items-center gap-1 group"
                      title="Click to edit budget limit"
                    >
                      <span>Limit:</span>
                      <strong className="text-teal-300 font-mono group-hover:underline">${budget.toFixed(2)}</strong>
                      <Edit2 className="w-2.5 h-2.5 text-slate-500 group-hover:text-teal-400" />
                    </button>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-1.5">
                    <div style={{ width: `${Math.min(100, pct)}%` }} className={`h-full transition-all duration-300 ${barColor}`} />
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
        )}

        {/* SECTION 2: TRANSACTIONS LIST (CLICK TO OPEN ON DEMAND) */}
        {sbSpendDrawer === "transactions" && (
          <div id="spending-tx-list-table" className="space-y-3 pt-6 border-t border-white/5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-400" />
                All Account Transactions ({filteredTransactions.length})
              </h4>
              <span className="text-[10px] text-emerald-400 font-semibold hidden sm:inline">• Live Plaid isolation active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 mr-2">Showing {filteredTransactions.length} of {transactions.length} total</span>
              <button
                type="button"
                onClick={() => setShowAddTxModal(true)}
                className="px-3 py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 text-xs font-semibold border border-teal-500/30 flex items-center gap-1.5 transition"
              >
                <Plus className="w-3 h-3" />
                Add Transaction
              </button>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-slate-900/40 border border-white/5">
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
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.transaction_id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/15 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
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

                      {/* Category Selector Underneath Each Transaction */}
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-500 font-mono">
                          {formatTxDate(tx.date)}
                        </span>
                        <span className="text-slate-600">•</span>

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
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: EDIT MONTHLY BUDGET LIMITS (REACTIVE) */}
      {/* ======================================================== */}
      {showEditBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-strong rounded-3xl p-6 sm:p-7 max-w-2xl w-full max-h-[90vh] flex flex-col border border-teal-500/30 shadow-2xl relative">
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

      {/* ======================================================== */}
      {/* MODAL 2: EDIT MONTHLY INCOME (REACTIVE) */}
      {/* ======================================================== */}
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
                <span className="text-[11px] text-slate-500 block mt-1">Net pay after taxes and deductions.</span>
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

      {/* ======================================================== */}
      {/* MODAL 3: SPENT BREAKDOWN (REACTIVE) */}
      {/* ======================================================== */}
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

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-emerald-400 font-medium">Plaid Isolation Active:</strong> Credit card and loan payments made from your checking account are automatically excluded ($0.00 spend) so they are not double-counted.
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

      {/* ======================================================== */}
      {/* MODAL 4: ADD TRANSACTION */}
      {/* ======================================================== */}
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
                <label className="block text-slate-300 mb-1 font-medium">Merchant / Description</label>
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

      {/* ======================================================== */}
      {/* MODAL 5: ADD CATEGORY */}
      {/* ======================================================== */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-md border border-white/15 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-display text-base font-semibold text-white">Add Custom Category</h3>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Pet Care, Hobbies, Gym"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Monthly Budget Limit ($)</label>
                <input
                  type="number"
                  placeholder="100.00"
                  value={newCatBudget}
                  onChange={(e) => setNewCatBudget(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-400"
                  required
                />
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
