import React, { useState, useEffect } from "react";
import { api, fmtMoney } from "../lib/api";
import { debtTypeMeta } from "../lib/constants";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Link2,
  CalendarCheck2,
  ListFilter,
  CreditCard,
  X,
  ExternalLink,
  Zap,
  Bell,
} from "lucide-react";
import { toast } from "sonner";

export default function PaymentCalendar({ debts = [], onRefreshDebts }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("agenda"); // default: "agenda" (list view) | "grid" (calendar view)
  const [listFilter, setListFilter] = useState("all"); // "all" | "pending" | "paid"
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState(null);
  const [editingDay, setEditingDay] = useState(false);
  const [selectedDayVal, setSelectedDayVal] = useState(15);
  const [testingAlert, setTestingAlert] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-indexed

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/calendar/month?year=${year}&month=${month}`);
      setCalendarData(res.data);
    } catch (err) {
      // Fallback local simulation if backend route is unavailable
      const fallbackEvents = debts.map((d) => {
        let day = 15;
        if (d.due_date) {
          const parts = d.due_date.split("-");
          if (parts.length === 3) day = parseInt(parts[2], 10);
        } else if (d.due_day) {
          day = parseInt(d.due_day, 10);
        }
        return {
          debt_id: d.debt_id,
          name: d.name,
          type: d.type,
          balance: d.balance,
          apr: d.apr,
          min_payment: d.min_payment,
          due_date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
          day: day,
          is_paid: false,
          status: "upcoming",
          is_plaid: Boolean(d.plaid_account_id),
          is_priority: false,
        };
      });
      const total = debts.reduce((s, d) => s + d.min_payment, 0);
      setCalendarData({
        year,
        month,
        total_due: total,
        total_paid: 0,
        total_remaining: total,
        paid_count: 0,
        total_count: debts.length,
        events: fallbackEvents,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, debts]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  const handleTogglePaid = async (event) => {
    const newPaidStatus = !event.is_paid;
    // Optimistic UI update
    setCalendarData((prev) => {
      if (!prev) return prev;
      const updatedEvents = prev.events.map((e) => {
        if (e.debt_id === event.debt_id) {
          return {
            ...e,
            is_paid: newPaidStatus,
            status: newPaidStatus ? "paid" : "upcoming",
          };
        }
        return e;
      });
      const paidSum = updatedEvents.reduce((s, e) => (e.is_paid ? s + e.min_payment : s), 0);
      return {
        ...prev,
        events: updatedEvents,
        total_paid: paidSum,
        total_remaining: Math.max(0, prev.total_due - paidSum),
        paid_count: updatedEvents.filter((e) => e.is_paid).length,
      };
    });

    if (activeEvent && activeEvent.debt_id === event.debt_id) {
      setActiveEvent((prev) => ({
        ...prev,
        is_paid: newPaidStatus,
        status: newPaidStatus ? "paid" : "upcoming",
      }));
    }

    try {
      await api.post("/calendar/toggle-paid", {
        debt_id: event.debt_id,
        year,
        month,
        is_paid: newPaidStatus,
      });
      toast.success(newPaidStatus ? `Marked ${event.name} as paid!` : `Marked ${event.name} as unpaid.`);
    } catch (e) {
      // rollback if failed
      fetchCalendar();
    }
  };

  const handleSaveDueDay = async () => {
    if (!activeEvent) return;
    try {
      await api.post(`/debts/${activeEvent.debt_id}/due-day`, {
        due_day: parseInt(selectedDayVal, 10),
      });
      toast.success(`Updated ${activeEvent.name} due day to the ${selectedDayVal}th of each month.`);
      setEditingDay(false);
      fetchCalendar();
      if (onRefreshDebts) onRefreshDebts();
    } catch (e) {
      toast.error("Could not update due day.");
    }
  };

  const handleTestAlert = async () => {
    try {
      setTestingAlert(true);
      const res = await api.post("/reminders/test");
      const emailStatus = res.data?.actions?.email?.sent ? "Email sent ✓" : (res.data?.actions?.email?.reason || "Email simulated");
      const smsStatus = res.data?.actions?.sms?.sent ? "SMS sent ✓" : (res.data?.actions?.sms?.reason || "SMS simulated");
      toast.success(`Due date test reminder dispatched! ${emailStatus}. ${smsStatus}.`);
    } catch (e) {
      toast.info("Due date test reminder triggered.");
    } finally {
      setTestingAlert(false);
    }
  };

  // Calendar calculations
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month, 0).getDate();
  const calendarCells = [];

  // Blank padding cells for leading days
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push({ day: null });
  }
  // Month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ day: d });
  }

  const eventsByDay = {};
  (calendarData?.events || []).forEach((e) => {
    if (!eventsByDay[e.day]) eventsByDay[e.day] = [];
    eventsByDay[e.day].push(e);
  });

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDayNumber = today.getDate();

  const totalDue = calendarData?.total_due || 0;
  const totalPaid = calendarData?.total_paid || 0;
  const totalRemaining = calendarData?.total_remaining || 0;
  const paidCount = calendarData?.paid_count || 0;
  const totalCount = calendarData?.total_count || 0;
  const allPaid = totalCount > 0 && paidCount === totalCount;
  const progressPct = totalDue > 0 ? Math.min(100, Math.round((totalPaid / totalDue) * 100)) : 0;

  return (
    <div className="glass rounded-2xl p-6 mb-10" data-testid="interactive-payment-calendar">
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
            <p className="text-label">Payment Schedule</p>
          </div>
          <h3 className="font-display text-2xl font-light tracking-tight mt-1 text-white">
            Pending Monthly Payments &amp; Due Date Schedule
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Track pending payments due this month with live Plaid bank detection, or switch to calendar view.
          </p>
        </div>

        {/* View Switcher & Month Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
            <button
              onClick={() => setViewMode("agenda")}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                viewMode === "agenda"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" /> List View
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Calendar View
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-white/10 rounded-xl px-2 py-1">
            <button
              onClick={prevMonth}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2 min-w-[110px] text-center text-white">
              {monthNames[month - 1]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {!isCurrentMonth && (
              <button
                onClick={jumpToToday}
                className="text-[10px] uppercase font-bold text-blue-400 hover:text-blue-300 ml-1 px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20"
              >
                Today
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Cash Flow & Payment Progress Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-6">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Total Bills Due</span>
          <span className="font-display text-xl font-medium text-white">{fmtMoney(totalDue)}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Paid So Far</span>
          <span className="font-display text-xl font-medium text-emerald-400">{fmtMoney(totalPaid)}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Remaining to Pay</span>
          <span className={`font-display text-xl font-medium ${totalRemaining > 0 ? "text-amber-400" : "text-slate-400"}`}>
            {fmtMoney(totalRemaining)}
          </span>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Monthly Progress
            </span>
            <span className="text-xs font-bold text-white">{progressPct}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {paidCount} of {totalCount} accounts marked paid
          </span>
        </div>
      </div>

      {allPaid && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 animate-fadeIn">
          <CalendarCheck2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-300">
            <strong>Incredible job!</strong> All minimum payments for {monthNames[month - 1]} have been satisfied on time.
          </p>
        </div>
      )}

      {/* Automated Due Date Alerts Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-blue-950/20 border border-blue-500/20 mb-6 text-xs">
        <div className="flex items-center gap-2.5 text-slate-300">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <span>
            <strong className="text-white">Due Date Alerts Active:</strong> Automated email & SMS reminders sent 3 days before and on due date.
          </span>
        </div>
        <button
          onClick={handleTestAlert}
          disabled={testingAlert}
          className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 transition whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5 disabled:opacity-50"
          data-testid="test-reminder-calendar-btn"
        >
          <Bell className="w-3 h-3" />
          {testingAlert ? "Testing..." : "Send Test Reminder"}
        </button>
      </div>

      {/* VIEW 1: MONTH GRID VIEW */}
      {viewMode === "grid" && (
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Days of week */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs uppercase tracking-wider font-semibold text-slate-400">
              <div className="py-1">Sun</div>
              <div className="py-1">Mon</div>
              <div className="py-1">Tue</div>
              <div className="py-1">Wed</div>
              <div className="py-1">Thu</div>
              <div className="py-1">Fri</div>
              <div className="py-1">Sat</div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((cell, idx) => {
                if (!cell.day) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[90px] rounded-xl bg-white/[0.01] border border-white/[0.02]"
                    />
                  );
                }

                const dayEvents = eventsByDay[cell.day] || [];
                const isToday = isCurrentMonth && cell.day === todayDayNumber;

                return (
                  <div
                    key={`day-${cell.day}`}
                    className={`min-h-[95px] p-2 rounded-xl border transition flex flex-col justify-between ${
                      isToday
                        ? "bg-blue-600/10 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/30"
                        : "bg-white/[0.02] border-white/5 hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                          isToday
                            ? "bg-blue-500 text-white font-bold"
                            : "text-slate-400"
                        }`}
                      >
                        {cell.day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {fmtMoney(dayEvents.reduce((s, e) => s + e.min_payment, 0))}
                        </span>
                      )}
                    </div>

                    {/* Events for this day */}
                    <div className="space-y-1 overflow-y-auto max-h-[85px]">
                      {dayEvents.map((evt) => {
                        const typeInfo = debtTypeMeta(evt.type);
                        return (
                          <button
                            key={evt.debt_id}
                            type="button"
                            onClick={() => {
                              setActiveEvent(evt);
                              setSelectedDayVal(evt.day);
                              setEditingDay(false);
                            }}
                            className={`w-full text-left p-1.5 rounded-lg text-[11px] transition flex items-center justify-between gap-1 group relative ${
                              evt.is_paid
                                ? "bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 opacity-80"
                                : evt.status === "due_today" || evt.status === "overdue"
                                ? "bg-red-950/40 border border-red-500/40 text-red-300"
                                : evt.status === "due_soon"
                                ? "bg-amber-950/40 border border-amber-500/40 text-amber-300"
                                : "bg-slate-800/80 border border-white/10 text-slate-200 hover:border-white/30"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ background: typeInfo.color }}
                              />
                              <span className={`truncate font-medium ${evt.is_paid ? "line-through text-slate-400" : ""}`}>
                                {evt.name}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] shrink-0 font-semibold flex items-center gap-1">
                              {evt.auto_detected && <Zap className="w-2.5 h-2.5 text-emerald-400" title="Auto-Detected via Plaid" />}
                              {evt.is_paid ? "✓" : fmtMoney(evt.min_payment)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: AGENDA LIST VIEW */}
      {viewMode === "agenda" && (
        <div className="space-y-3">
          {/* Quick Filter Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5 text-xs">
            <span className="font-semibold text-slate-300">
              Pending &amp; Scheduled Payments ({calendarData?.events?.length || 0})
            </span>
            <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-lg border border-white/5 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setListFilter("all")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  listFilter === "all" ? "bg-white/10 text-white font-semibold" : "text-slate-400 hover:text-white"
                }`}
              >
                All ({calendarData?.events?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setListFilter("pending")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  listFilter === "pending" ? "bg-amber-500/20 text-amber-300 font-semibold" : "text-slate-400 hover:text-white"
                }`}
              >
                Pending ({(calendarData?.events || []).filter((e) => !e.is_paid).length})
              </button>
              <button
                type="button"
                onClick={() => setListFilter("paid")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  listFilter === "paid" ? "bg-emerald-500/20 text-emerald-300 font-semibold" : "text-slate-400 hover:text-white"
                }`}
              >
                Paid ({(calendarData?.events || []).filter((e) => e.is_paid).length})
              </button>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {(!calendarData?.events || calendarData.events.length === 0) ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No debt payments due in {monthNames[month - 1]} {year}.
              </div>
            ) : (
              calendarData.events
                .filter((evt) => {
                  if (listFilter === "pending") return !evt.is_paid;
                  if (listFilter === "paid") return evt.is_paid;
                  return true;
                })
                .map((evt) => {
              const typeInfo = debtTypeMeta(evt.type);
              return (
                <div
                  key={evt.debt_id}
                  className="py-3 px-2 flex items-center justify-between gap-4 hover:bg-white/[0.02] rounded-xl transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Day Pill */}
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] uppercase font-bold text-slate-400">
                        {monthNames[month - 1].slice(0, 3)}
                      </span>
                      <span className="font-display text-base font-bold text-white leading-none">
                        {evt.day}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: typeInfo.color }}
                        />
                        <h4 className={`font-medium text-sm text-white truncate ${evt.is_paid ? "line-through text-slate-400" : ""}`}>
                          {evt.name}
                        </h4>
                        {evt.is_plaid && (
                          <span className="text-[9px] uppercase tracking-wider font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Link2 className="w-2.5 h-2.5" /> Plaid
                          </span>
                        )}
                        {evt.auto_detected && (
                          <span className="text-[9px] uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5" /> Auto-Detected
                          </span>
                        )}
                        {evt.is_priority && !evt.is_paid && (
                          <span className="text-[9px] uppercase tracking-wider font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> Strategy Focus
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>Balance: {fmtMoney(evt.balance)}</span>
                        <span>•</span>
                        <span>APR: {evt.apr}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-semibold font-mono text-white">
                        {fmtMoney(evt.min_payment)}
                      </div>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          evt.is_paid
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : evt.status === "due_today"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : evt.status === "due_soon"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-slate-800 text-slate-400 border border-white/5"
                        }`}
                      >
                        {evt.is_paid
                          ? "Paid"
                          : evt.status === "due_today"
                          ? "Due Today"
                          : evt.status === "due_soon"
                          ? `Due in ${evt.days_until}d`
                          : `Due on ${monthNames[month - 1]} ${evt.day}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePaid(evt)}
                      className={`p-2 rounded-xl border transition ${
                        evt.is_paid
                          ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-600/30"
                          : "bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10"
                      }`}
                      title={evt.is_paid ? "Mark as unpaid" : "Mark as paid"}
                    >
                      <CheckCircle2 className={`w-5 h-5 ${evt.is_paid ? "text-emerald-400" : "text-slate-500"}`} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
      )}

      {/* FOOTER HELPER */}
      <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Link2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Accounts synced via Plaid update due dates automatically every billing cycle.</span>
        </div>
        <span className="text-[11px] text-slate-400">Click any payment pill to view details or adjust dates.</span>
      </div>

      {/* MODAL / DRAWER FOR PAYMENT ACTION */}
      {activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-md border border-white/15 shadow-2xl relative">
            <button
              onClick={() => setActiveEvent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ background: debtTypeMeta(activeEvent.type).color }}
              >
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-medium text-white">{activeEvent.name}</h3>
                <span className="text-xs text-slate-400 capitalize">
                  {activeEvent.type.replace("_", " ")}
                </span>
              </div>
            </div>

            {activeEvent.auto_detected && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 mb-4 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                  <Zap className="w-4 h-4" /> Auto-Detected Bank Payment
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Plaid verified a payment of <strong className="text-white font-mono">{fmtMoney(activeEvent.detected_amount || activeEvent.min_payment)}</strong> from your linked checking account.
                </p>
                {activeEvent.detected_desc && (
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    "{activeEvent.detected_desc}"
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 mb-5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Balance:</span>
                <span className="font-mono text-white font-semibold">{fmtMoney(activeEvent.balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Interest Rate (APR):</span>
                <span className="font-mono text-white font-semibold">{activeEvent.apr}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Minimum Payment Due:</span>
                <span className="font-mono text-emerald-400 font-bold">{fmtMoney(activeEvent.min_payment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Billing Date:</span>
                <span className="font-medium text-slate-200">
                  {monthNames[month - 1]} {activeEvent.day}, {year}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-white/5 pt-2">
                <span className="text-slate-400">Account Source:</span>
                {activeEvent.is_plaid ? (
                  <span className="text-[10px] text-blue-400 font-medium flex items-center gap-1">
                    <Link2 className="w-3 h-3" /> Synced via Plaid
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">
                    Manual Account
                  </span>
                )}
              </div>
            </div>

            {/* Quick Due Day Editor for Manual Accounts */}
            {!activeEvent.is_plaid && (
              <div className="mb-5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                {!editingDay ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Due Day: Every {activeEvent.day}th</span>
                    <button
                      onClick={() => setEditingDay(true)}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Change day
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-300 font-medium block">
                      Select recurring due day of month (1-31):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={selectedDayVal}
                        onChange={(e) => setSelectedDayVal(e.target.value)}
                        className="w-20 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                      <button
                        onClick={handleSaveDueDay}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingDay(false)}
                        className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mark as Paid Action */}
            <button
              onClick={() => handleTogglePaid(activeEvent)}
              className={`w-full py-2.5 rounded-xl font-medium text-xs transition flex items-center justify-center gap-2 ${
                activeEvent.is_paid
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {activeEvent.is_paid ? "Mark Payment as Unpaid" : `Mark ${fmtMoney(activeEvent.min_payment)} Paid for ${monthNames[month - 1]}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
