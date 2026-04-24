import React, { useEffect, useMemo, useState } from "react";
import "./ExpenseTracker.css";
import { createTransaction, deleteTransactionApi, getTransactions, updateTransaction } from "../api";
import * as XLSX from "xlsx";

function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10.5 12 4.5l8 6v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconIncome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M8 9l4-4 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconExpenseNav() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 19V5M8 15l4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDollarCard() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v10M14 9.5c0-1.1-1-2-2.5-2S9 8.9 9 10s1.2 1.4 3 2 3 1.2 3 2.5-1 2-3 2-3-1-3-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconPiggy() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19 12c0 4-3 7-7 7H8l-3 2v-3.5A6 6 0 0 1 5 12a6 6 0 0 1 7-7h1l2-2v3c2 0 3 1.5 4 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="12" r="0.8" fill="currentColor" />
    </svg>
  );
}

function IconFork() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 3v9M11 12c0 2 1.5 4 4 4M15 3v4M7 3v9c0 2 1 4 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 12a9 9 0 0 0-15-6.7L3 8M3 3v5h5M3 12a9 9 0 0 0 15 6.7L21 16m0 5v-5h-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPie() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 3a9 9 0 1 0 9 9h-9V3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13 3a9 9 0 0 1 8 8h-8V3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function IconTrendingUp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 16l6-6 4 4 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 8h4v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 7h15l-2 8H7L6 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M6 7 5 4H2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
    </svg>
  );
}

function IconSpark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2l1.1 5.3L18 8.4l-4.4 2.6L12 16l-1.6-5-4.4-2.6 4.9-1.1L12 2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M4 14l.6 2.6L7 17.2l-2 .9L4 20l-.9-1.9-2-.9 2.4-.6L4 14Z" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20h4l11-11a2.5 2.5 0 0 0-4-4L4 16v4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M13 6l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 7h12M10 11v7M14 11v7M9 7l1-2h4l1 2M7 7l1 14h8l1-14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ExpenseTracker({ onBack }) {
  const [section, setSection] = useState("dashboard");
  const [timeframe, setTimeframe] = useState("monthly");
  const [txOpen, setTxOpen] = useState(false);
  const [txEditId, setTxEditId] = useState("");
  const [txDesc, setTxDesc] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState("Income"); // Income | Expense
  const [txCategory, setTxCategory] = useState("Food");
  const [txDate, setTxDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [txErr, setTxErr] = useState("");

  const nav = useMemo(
    () => [
      { id: "dashboard", label: "Dashboard", icon: <IconDashboard /> },
      { id: "income", label: "Income", icon: <IconIncome /> },
      { id: "expenses", label: "Expenses", icon: <IconExpenseNav /> },
    ],
    [],
  );

  const [transactions, setTransactions] = useState([]);
  const [txLoadErr, setTxLoadErr] = useState("");

  const [exportAll, setExportAll] = useState(false);
  const [exportIncludeIncome, setExportIncludeIncome] = useState(true);
  const [exportIncludeExpense, setExportIncludeExpense] = useState(true);
  const [exportErr, setExportErr] = useState("");

  const categories = useMemo(
    () => [
      "Bills",
      "Bonus",
      "Education",
      "Entertainment",
      "Food",
      "Freelance",
      "Health",
      "Healthcare",
      "Housing",
      "Investments",
      "Salary",
      "Shopping",
      "Transport",
      "Travel",
      "Utilities",
      "Other",
    ],
    [],
  );

  function parseMoney(v) {
    const n = Number(String(v || "").replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }

  function monthKey(dISO) {
    return String(dISO || "").slice(0, 7); // YYYY-MM
  }

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function startOfRollingWeekISO(dateISO) {
    const d = new Date(`${dateISO}T00:00:00`);
    const start = new Date(d);
    start.setDate(d.getDate() - 6);
    return start.toISOString().slice(0, 10);
  }

  const period = useMemo(() => {
    if (timeframe === "daily") return { label: "Today", fromISO: todayISO, toISO: todayISO };
    if (timeframe === "weekly") return { label: "Last 7 days", fromISO: startOfRollingWeekISO(todayISO), toISO: todayISO };
    return { label: "This month", fromISO: `${monthKey(todayISO)}-01`, toISO: todayISO };
  }, [timeframe, todayISO]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setTxLoadErr("");
      try {
        const res = await getTransactions();
        const items = (res.items || []).map((t) => ({
          id: t._id,
          type: t.type,
          description: t.description,
          category: t.category,
          amount: t.amount,
          dateISO: t.dateISO,
        }));
        if (!cancelled) setTransactions(items);
      } catch (e) {
        if (!cancelled) setTxLoadErr(e?.message || "Failed to load transactions");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const txPeriod = useMemo(() => {
    return transactions.filter((t) => String(t.dateISO) >= period.fromISO && String(t.dateISO) <= period.toISO);
  }, [transactions, period.fromISO, period.toISO]);

  const totals = useMemo(() => {
    const income = txPeriod.filter((t) => t.type === "Income").reduce((acc, t) => acc + (t.amount || 0), 0);
    const expense = txPeriod.filter((t) => t.type === "Expense").reduce((acc, t) => acc + (t.amount || 0), 0);
    const savings = Math.max(0, income - expense);
    const balance = income - expense;
    const savingRate = income > 0 ? (savings / income) * 100 : 0;
    return { income, expense, savings, balance, savingRate };
  }, [txPeriod]);

  const recentTx = useMemo(() => {
    return [...transactions]
      .sort((a, b) => String(b.dateISO).localeCompare(String(a.dateISO)))
      .slice(0, 6);
  }, [transactions]);

  const recentIncome = useMemo(() => txPeriod.filter((t) => t.type === "Income").slice(-5).reverse(), [txPeriod]);
  const recentExpense = useMemo(() => txPeriod.filter((t) => t.type === "Expense").slice(-5).reverse(), [txPeriod]);

  const spendByCategory = useMemo(() => {
    const map = new Map();
    txPeriod
      .filter((t) => t.type === "Expense")
      .forEach((t) => map.set(t.category, (map.get(t.category) || 0) + (t.amount || 0)));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [txPeriod]);

  const distTotal = useMemo(() => spendByCategory.reduce((acc, [, v]) => acc + (Number(v) || 0), 0), [spendByCategory]);

  const distSegments = useMemo(() => {
    const palette = ["#22c55e", "#06b6d4", "#3b82f6", "#6366f1", "#f97316", "#f43f5e", "#a855f7", "#14b8a6"];
    if (!distTotal) return [];
    const top = spendByCategory.slice(0, 6);
    const rest = spendByCategory.slice(6).reduce((acc, [, v]) => acc + (Number(v) || 0), 0);
    const items = rest > 0 ? [...top, ["Other", rest]] : top;
    return items.map(([name, value], idx) => ({
      name,
      value: Number(value) || 0,
      color: palette[idx % palette.length],
      pct: ((Number(value) || 0) / distTotal) * 100,
    }));
  }, [spendByCategory, distTotal]);

  const incomeByCategory = useMemo(() => {
    const map = new Map();
    txPeriod
      .filter((t) => t.type === "Income")
      .forEach((t) => map.set(t.category, (map.get(t.category) || 0) + (t.amount || 0)));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [txPeriod]);

  const incomeTotal = useMemo(() => incomeByCategory.reduce((acc, [, v]) => acc + (Number(v) || 0), 0), [incomeByCategory]);

  const incomeSegments = useMemo(() => {
    const palette = ["#22c55e", "#06b6d4", "#3b82f6", "#6366f1", "#f97316", "#f43f5e", "#a855f7", "#14b8a6"];
    if (!incomeTotal) return [];
    const top = incomeByCategory.slice(0, 6);
    const rest = incomeByCategory.slice(6).reduce((acc, [, v]) => acc + (Number(v) || 0), 0);
    const items = rest > 0 ? [...top, ["Other", rest]] : top;
    return items.map(([name, value], idx) => ({
      name,
      value: Number(value) || 0,
      color: palette[idx % palette.length],
      pct: ((Number(value) || 0) / incomeTotal) * 100,
    }));
  }, [incomeByCategory, incomeTotal]);

  function fmtMoney(n) {
    const v = Number(n) || 0;
    return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  function downloadExcel(items, filenameBase) {
    const rows = items.map((t) => ({
      Date: t.dateISO || "",
      Type: t.type || "",
      Description: t.description || "",
      Category: t.category || "",
      Amount: Number(t.amount) || 0,
    }));

    const totalIncome = items.filter((t) => t.type === "Income").reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const totalExpense = items.filter((t) => t.type === "Expense").reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const balance = totalIncome - totalExpense;

    const wsTx = XLSX.utils.json_to_sheet(rows, { header: ["Date", "Type", "Description", "Category", "Amount"] });
    wsTx["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 28 }, { wch: 16 }, { wch: 12 }];

    const wsSummary = XLSX.utils.aoa_to_sheet([
      ["Expense Tracker Export"],
      [],
      ["Period label", exportAll ? "All transactions" : period.label],
      ["From", exportAll ? "" : period.fromISO],
      ["To", exportAll ? "" : period.toISO],
      [],
      ["Total income", totalIncome],
      ["Total expense", totalExpense],
      ["Balance", balance],
      ["Records", items.length],
      ["Generated", new Date().toISOString()],
    ]);
    wsSummary["!cols"] = [{ wch: 18 }, { wch: 32 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsTx, "Transactions");
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filenameBase}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function ExportExcelCard({ baseItems, filenameBase, subtitle }) {
    return (
      <div className="etExportCard" aria-label="Export to Excel">
        <div className="etExportHead">
          <div>
            <div className="etExportTitle">Export to Excel</div>
            <div className="etExportSub">{subtitle || "Download a detailed `.xlsx` report for your records."}</div>
          </div>
          <button
            type="button"
            className="etBtnPrimary"
            onClick={() => {
              setExportErr("");
              const base = exportAll ? transactions : baseItems;
              const filtered = base.filter((t) => (exportIncludeIncome && t.type === "Income") || (exportIncludeExpense && t.type === "Expense"));
              if (!exportIncludeIncome && !exportIncludeExpense) return setExportErr("Select at least one type (Income/Expense).");
              if (!filtered.length) return setExportErr("No matching transactions to export.");
              const name = exportAll ? `${filenameBase}_all` : filenameBase;
              downloadExcel(filtered, name);
            }}
          >
            Generate Excel
          </button>
        </div>

        <div className="etExportOpts">
          <label className="etChk">
            <input type="checkbox" checked={exportAll} onChange={(e) => setExportAll(e.target.checked)} />
            <span>Export all transactions (ignore timeframe)</span>
          </label>
          <label className="etChk">
            <input type="checkbox" checked={exportIncludeIncome} onChange={(e) => setExportIncludeIncome(e.target.checked)} />
            <span>Include income</span>
          </label>
          <label className="etChk">
            <input type="checkbox" checked={exportIncludeExpense} onChange={(e) => setExportIncludeExpense(e.target.checked)} />
            <span>Include expenses</span>
          </label>
        </div>

        {exportErr ? <div className="etExportErr">{exportErr}</div> : null}
      </div>
    );
  }

  /** Donut ring fill (0–100) matching Income / Spent % / Savings rate — uses same angles as `.etRing` (start at bottom). */
  function ringFillStyle(color, pct0to100) {
    const p = Math.min(100, Math.max(0, Number(pct0to100) || 0));
    const sweep = (p / 100) * 360;
    const track = "rgba(226, 232, 240, 0.75)";
    return {
      background: `conic-gradient(from 180deg, ${color} 0deg, ${color} ${sweep}deg, ${track} ${sweep}deg 360deg), radial-gradient(circle at 50% 50%, #fff 0 58%, rgba(255, 255, 255, 0) 59%)`,
    };
  }

  const dashboardRings = useMemo(() => {
    const inc = totals.income;
    const exp = totals.expense;
    const sav = totals.savings;
    const rate = totals.savingRate;
    const spentPctOfIncome = inc > 0 ? Math.min(100, (exp / inc) * 100) : 0;
    const incomeFill = inc > 0 ? 100 : 0;
    return [
      {
        key: "income",
        label: "Income",
        value: fmtMoney(inc),
        pctLabel: `${Math.round(inc > 0 ? 100 : 0)}%`,
        fillPct: incomeFill,
        color: "#34d399",
      },
      {
        key: "spent",
        label: "Spent",
        value: fmtMoney(exp),
        pctLabel: `${Math.round(spentPctOfIncome)}%`,
        fillPct: spentPctOfIncome,
        color: "#fb7185",
      },
      {
        key: "savings",
        label: "Savings",
        value: fmtMoney(sav),
        pctLabel: `${Math.round(Math.min(100, Math.max(0, rate)))}%`,
        fillPct: Math.min(100, Math.max(0, rate)),
        color: "#60a5fa",
      },
    ];
  }, [totals]);

  function fmtTxAmount(t) {
    const sign = t.type === "Expense" ? "-" : "+";
    return `${sign}${fmtMoney(t.amount).replace("$", "$")}`;
  }

  function openTxModal() {
    setTxErr("");
    setTxEditId("");
    setTxDesc("");
    setTxAmount("");
    setTxType("Income");
    setTxCategory("Food");
    setTxDate(new Date().toISOString().slice(0, 10));
    setTxOpen(true);
  }

  function openTxModalEdit(t) {
    setTxErr("");
    setTxEditId(t.id);
    setTxDesc(t.description || "");
    setTxAmount(String(t.amount ?? ""));
    setTxType(t.type || "Income");
    setTxCategory(t.category || "Other");
    setTxDate(t.dateISO || new Date().toISOString().slice(0, 10));
    setTxOpen(true);
  }

  async function addTransaction() {
    const desc = txDesc.trim();
    const amt = parseMoney(txAmount);
    if (!desc) return setTxErr("Please enter a description.");
    if (!Number.isFinite(amt) || amt <= 0) return setTxErr("Please enter a valid amount.");
    if (!txDate) return setTxErr("Please choose a date.");
    try {
      if (txEditId) {
        const res = await updateTransaction(txEditId, { type: txType, description: desc, category: txCategory, amount: amt, dateISO: txDate });
        const it = res.item;
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === txEditId ? { id: it._id, type: it.type, description: it.description, category: it.category, amount: it.amount, dateISO: it.dateISO } : t,
          ),
        );
      } else {
        const res = await createTransaction({ type: txType, description: desc, category: txCategory, amount: amt, dateISO: txDate });
        const it = res.item;
        setTransactions((prev) => [{ id: it._id, type: it.type, description: it.description, category: it.category, amount: it.amount, dateISO: it.dateISO }, ...prev]);
      }
      setTxOpen(false);
    } catch (e) {
      setTxErr(e?.message || "Failed to save transaction.");
    }
  }

  async function deleteTransaction(id) {
    const prev = transactions;
    setTransactions((p) => p.filter((t) => t.id !== id));
    try {
      await deleteTransactionApi(id);
    } catch (e) {
      setTransactions(prev);
      setTxErr(e?.message || "Failed to delete transaction.");
    }
  }

  return (
    <div className="et">
      <aside className="etSidebar">
        <div className="etNavHead">Menu</div>
        <nav className="etNav" aria-label="Expense tracker">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`etNavItem ${section === item.id ? "is-active" : ""}`}
              onClick={() => setSection(item.id)}
            >
              <span className="etNavIcon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="etMain">
        <header className="etTop">
          <div className="etTopLeft">
            {typeof onBack === "function" ? (
              <button type="button" className="etBackBtn" onClick={onBack}>
                ← Back
              </button>
            ) : (
              <div />
            )}
          </div>
        </header>

        {txLoadErr ? <div className="etBannerErr">{txLoadErr}</div> : null}

        {section === "dashboard" && (
          <>
            <div className="etPageHead">
              <h1 className="etPageTitle">Manage Your Money Smarter</h1>
              <p className="etPageSub">Track income and expenses by day, week, or month.</p>
            </div>

            <div className="etSummaryRow">
              <div className="etStatCard">
                <div className="etStatIcon etStatIcon--teal">
                  <IconDollarCard />
                </div>
                <div className="etStatBody">
                  <div className="etStatLabel">Total Balance</div>
                  <div className="etStatValue">{fmtMoney(Math.max(0, totals.balance))}</div>
                  <div className={`etStatHint ${totals.balance >= 0 ? "etStatHint--up" : ""}`}>
                    {totals.balance >= 0 ? "+" : "-"}
                    {fmtMoney(Math.abs(totals.balance)).replace("$", "$")} {period.label.toLowerCase()}
                  </div>
                </div>
              </div>
              <div className="etStatCard">
                <div className="etStatIcon etStatIcon--green">
                  <IconIncome />
                </div>
                <div className="etStatBody">
                  <div className="etStatLabel">Monthly Income</div>
                  <div className="etStatValue">{fmtMoney(totals.income)}</div>
                  <div className="etStatHint etStatHint--up">{period.label}</div>
                </div>
              </div>
              <div className="etStatCard">
                <div className="etStatIcon etStatIcon--orange">
                  <IconExpenseNav />
                </div>
                <div className="etStatBody">
                  <div className="etStatLabel">Monthly Expense</div>
                  <div className="etStatValue">{fmtMoney(totals.expense)}</div>
                  <div className="etStatHint">{period.label}</div>
                </div>
              </div>
              <div className="etStatCard">
                <div className="etStatIcon etStatIcon--blue">
                  <IconPiggy />
                </div>
                <div className="etStatBody">
                  <div className="etStatLabel">Saving Rate</div>
                  <div className="etStatValue">{Math.round(totals.savingRate)}%</div>
                  <div className="etStatHint etStatHint--badge">{totals.savingRate >= 35 ? "Excellent" : totals.savingRate >= 20 ? "Good" : "Start saving"}</div>
                </div>
              </div>
            </div>

            <div className="etMidGrid">
              <div className="etFinanceCard">
                <div className="etFinanceInner">
                  <h2 className="etFinanceTitle">Finance Dashboard</h2>
                  <p className="etFinanceSub">Track your income and expenses</p>
                  <button type="button" className="etBtnPrimary" onClick={openTxModal}>
                    + Add Transaction
                  </button>
                  <div className="etSeg">
                    {["daily", "weekly", "monthly"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`etSegBtn ${timeframe === t ? "is-on" : ""}`}
                        onClick={() => setTimeframe(t)}
                      >
                        {t === "daily" ? "Daily" : t === "weekly" ? "Weekly" : "Monthly"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="etFinanceStats">
                  <div className="etMiniStat">
                    <span className="etMiniLabel">Total Balance</span>
                    <span className="etMiniVal">{fmtMoney(Math.max(0, totals.balance)).replace("$", "")}</span>
                  </div>
                  <div className="etMiniStat">
                    <span className="etMiniLabel">{period.label} Expenses</span>
                    <span className="etMiniVal">{fmtMoney(totals.expense).replace("$", "")}</span>
                  </div>
                  <div className="etMiniStat">
                    <span className="etMiniLabel">{period.label} Savings</span>
                    <span className="etMiniVal">{fmtMoney(totals.savings).replace("$", "")}</span>
                  </div>
                </div>
              </div>

              <div className="etTxCard">
                <div className="etTxHead">
                  <h2 className="etTxTitle">Recent Transactions</h2>
                  <button type="button" className="etTxRefresh" aria-label="Refresh">
                    <IconRefresh />
                  </button>
                </div>
                <div className="etTxBanner">Transactions are stacked by date (newest first)</div>
                <ul className="etTxList">
                  {recentTx.map((t) => (
                    <li key={t.id} className="etTxItem">
                      <div className="etTxIcon">
                        <IconFork />
                      </div>
                      <div className="etTxMeta">
                        <div className="etTxName">{t.description}</div>
                        <div className="etTxDetail">
                          {t.dateISO} · {t.category}
                        </div>
                      </div>
                      <div className="etTxRight">
                        <div className={`etTxAmt ${t.type === "Income" ? "is-income" : ""}`}>{fmtTxAmount(t)}</div>
                        <div className="etTxActions">
                          <button type="button" className="etTxAction" onClick={() => openTxModalEdit(t)} aria-label="Edit">
                            <IconEdit />
                          </button>
                          <button
                            type="button"
                            className="etTxAction etTxAction--danger"
                            onClick={() => deleteTransaction(t.id)}
                            aria-label="Delete"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="etBottomGrid" aria-label="Expense overview">
              <div className="etBottomLeft">
                <div className="etRingRow">
                  {dashboardRings.map((c) => (
                    <div key={c.key} className="etRingCard">
                      <div
                        className="etRing etRing--dynamic"
                        style={ringFillStyle(c.color, c.fillPct)}
                        aria-hidden="true"
                      />
                      <div className="etRingLabel">{c.label}</div>
                      <div className="etRingValue">{c.value}</div>
                      <div className="etRingPct">{c.pctLabel}</div>
                      <div className="etRingFoot">{period.label}</div>
                    </div>
                  ))}
                </div>

                <div className="etDistCard">
                  <div className="etDistHead">
                    <div className="etDistTitle">
                      <span className="etDistIcon" aria-hidden="true">
                        <IconPie />
                      </span>
                      Expense Distribution <span className="etDistSub">({period.label})</span>
                    </div>
                  </div>
                  <div className="etDistBody">
                    {distTotal ? (
                      <div className="etDistGrid">
                        <div className="etDonutWrap" aria-label="Expense distribution donut chart">
                          <svg className="etDonut" viewBox="0 0 44 44" role="img" aria-label="Expense distribution">
                            <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(226,232,240,0.9)" strokeWidth="6" />
                            {(() => {
                              const circ = 2 * Math.PI * 18;
                              let offset = 0;
                              return distSegments.map((s) => {
                                const dash = (s.pct / 100) * circ;
                                const seg = (
                                  <circle
                                    key={s.name}
                                    cx="22"
                                    cy="22"
                                    r="18"
                                    fill="none"
                                    stroke={s.color}
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeDasharray={`${dash} ${circ - dash}`}
                                    strokeDashoffset={-offset}
                                    transform="rotate(-90 22 22)"
                                  />
                                );
                                offset += dash;
                                return seg;
                              });
                            })()}
                          </svg>
                          <div className="etDonutCenter">
                            <div className="etDonutTotal">{fmtMoney(distTotal)}</div>
                            <div className="etDonutSub">Total spent</div>
                          </div>
                        </div>

                        <div className="etDistLegend" aria-label="Legend">
                          {distSegments.map((s) => (
                            <div key={s.name} className="etLegendRow">
                              <span className="etLegendDot" style={{ background: s.color }} aria-hidden="true" />
                              <span className="etLegendName">{s.name}</span>
                              <span className="etLegendPct">{s.pct.toFixed(0)}%</span>
                              <span className="etLegendVal">{fmtMoney(s.value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="etDistEmpty">Add expense transactions to see the distribution diagram.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="etBottomRight">
                <div className="etCatCard">
                  <div className="etCatTop">
                    <button type="button" className="etCatLink" onClick={() => setSection("transactions")}>
                      View All Transactions ({txPeriod.length})
                    </button>
                  </div>

                  <div className="etCatHead">
                    <div className="etCatTitle">
                      <span className="etCatIcon" aria-hidden="true">
                        <IconPie />
                      </span>
                      Spending by Category
                    </div>
                  </div>

                  {spendByCategory.length ? (
                    <div className="etCatRow">
                      <div className="etCatLeft">
                        <span className="etCatBadge" aria-hidden="true">
                          🍽️
                        </span>
                        <span className="etCatName">{spendByCategory[0][0]}</span>
                      </div>
                      <div className="etCatAmt">{fmtMoney(spendByCategory[0][1])}</div>
                    </div>
                  ) : (
                    <div className="etCatRow">
                      <div className="etCatLeft">
                        <span className="etCatBadge" aria-hidden="true">
                          🧾
                        </span>
                        <span className="etCatName">No expenses yet</span>
                      </div>
                      <div className="etCatAmt">$0</div>
                    </div>
                  )}

                  <div className="etCatTotals">
                    <div className="etCatTotal etCatTotal--income">
                      <div className="etCatTotalLabel">Total Income</div>
                      <div className="etCatTotalVal">{fmtMoney(totals.income)}</div>
                    </div>
                    <div className="etCatTotal etCatTotal--expense">
                      <div className="etCatTotalLabel">Total Expense</div>
                      <div className="etCatTotalVal">{fmtMoney(totals.expense)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="etRecentGrid" aria-label="Recent income and expenses">
              <div className="etRecentCard etRecentCard--income">
                <div className="etRecentHead">
                  <div className="etRecentTitle">
                    <span className="etRecentIcon etRecentIcon--income" aria-hidden="true">
                      <IconTrendingUp />
                    </span>
                    Recent Income <span className="etRecentSub">(This Month)</span>
                  </div>
                  <div className="etRecentPill etRecentPill--income">{recentIncome.length} records</div>
                </div>

                {recentIncome.length ? (
                  <div className="etRecentList">
                    {recentIncome.map((t) => (
                      <div key={t.id} className="etRecentItem">
                        <div className="etRecentItemName">{t.description}</div>
                        <div className="etRecentItemMeta">{t.dateISO}</div>
                        <div className="etRecentItemAmt is-income">{fmtMoney(t.amount)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="etRecentEmpty">
                    <div className="etRecentEmptyIcon etRecentEmptyIcon--income" aria-hidden="true">
                      $
                    </div>
                    <div className="etRecentEmptyText">No income transactions</div>
                  </div>
                )}
              </div>

              <div className="etRecentCard etRecentCard--expense">
                <div className="etRecentHead">
                  <div className="etRecentTitle">
                    <span className="etRecentIcon etRecentIcon--expense" aria-hidden="true">
                      <IconExpenseNav />
                    </span>
                    Recent Expenses <span className="etRecentSub">(This Month)</span>
                  </div>
                  <div className="etRecentPill etRecentPill--expense">{recentExpense.length} records</div>
                </div>

                {recentExpense.length ? (
                  <div className="etRecentList">
                    {recentExpense.map((t) => (
                      <div key={t.id} className="etRecentItem">
                        <div className="etRecentItemName">{t.description}</div>
                        <div className="etRecentItemMeta">
                          {t.dateISO} · {t.category}
                        </div>
                        <div className="etRecentItemAmt is-expense">-{fmtMoney(t.amount)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="etRecentEmpty">
                    <div className="etRecentEmptyIcon etRecentEmptyIcon--expense" aria-hidden="true">
                      <IconCart />
                    </div>
                    <div className="etRecentEmptyText">No expense transactions</div>
                  </div>
                )}
              </div>
            </div>

            <ExportExcelCard
              baseItems={txPeriod}
              filenameBase={`transactions_${period.fromISO}_to_${period.toISO}`}
              subtitle="Export this period’s transactions (or choose “all transactions”)."
            />
          </>
        )}

        {txOpen && (
          <div className="etModalOverlay" role="presentation" onClick={() => setTxOpen(false)}>
            <div className="etModal" role="dialog" aria-modal="true" aria-labelledby="etModalTitle" onClick={(e) => e.stopPropagation()}>
              <div className="etModalHead">
                <div id="etModalTitle" className="etModalTitle">
                  {txEditId ? "Edit Transaction" : "Add New Transaction"}
                </div>
                <button type="button" className="etModalClose" aria-label="Close" onClick={() => setTxOpen(false)}>
                  ×
                </button>
              </div>

              <div className="etModalBody">
                <label className="etField">
                  <span className="etFieldLabel">Description</span>
                  <input
                    className="etFieldInput"
                    value={txDesc}
                    onChange={(e) => {
                      setTxDesc(e.target.value);
                      if (txErr) setTxErr("");
                    }}
                    placeholder="Salary, Funds, etc."
                  />
                </label>

                <label className="etField">
                  <span className="etFieldLabel">Amount</span>
                  <input
                    className="etFieldInput"
                    value={txAmount}
                    onChange={(e) => {
                      setTxAmount(e.target.value);
                      if (txErr) setTxErr("");
                    }}
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </label>

                <div className="etField">
                  <div className="etFieldLabel">Type</div>
                  <div className="etTypeRow" role="tablist" aria-label="Transaction type">
                    <button
                      type="button"
                      className={`etTypeBtn ${txType === "Income" ? "is-on" : ""}`}
                      onClick={() => setTxType("Income")}
                    >
                      Income
                    </button>
                    <button
                      type="button"
                      className={`etTypeBtn etTypeBtn--expense ${txType === "Expense" ? "is-on" : ""}`}
                      onClick={() => setTxType("Expense")}
                    >
                      Expense
                    </button>
                  </div>
                </div>

                <label className="etField">
                  <span className="etFieldLabel">Category</span>
                  <select className="etFieldInput" value={txCategory} onChange={(e) => setTxCategory(e.target.value)}>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="etField">
                  <span className="etFieldLabel">Date</span>
                  <input className="etFieldInput" type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} />
                </label>

                {txErr && <div className="etModalErr">{txErr}</div>}
              </div>

              <button type="button" className="etModalSubmit" onClick={addTransaction}>
                {txEditId ? "Save Changes" : "Add Transaction"}
              </button>
            </div>
          </div>
        )}

        {section === "transactions" && (
          <>
            <div className="etPageHead etPageHead--row">
              <div>
                <h1 className="etPageTitle">All Transactions</h1>
                <p className="etPageSub">
                  Showing <b>{txPeriod.length}</b> records for <b>{period.label}</b>.
                </p>
              </div>
              <div className="etHeadActions">
                <button type="button" className="etBtnGhost" onClick={() => setSection("dashboard")}>
                  ← Back to Dashboard
                </button>
                <button type="button" className="etBtnPrimary" onClick={openTxModal}>
                  + Add Transaction
                </button>
              </div>
            </div>

            <div className="etTxCard">
              <div className="etTxHead">
                <div className="etTxTitle">Transactions</div>
                <button type="button" className="etTxRefresh" onClick={() => setTimeframe(timeframe)}>
                  <IconRefresh /> {period.fromISO} → {period.toISO}
                </button>
              </div>

              {txPeriod.length ? (
                <ul className="etTxList">
                  {txPeriod
                    .slice()
                    .sort((a, b) => String(b.dateISO).localeCompare(String(a.dateISO)))
                    .map((t) => (
                      <li key={t.id} className="etTxItem">
                        <div className={`etTxIcon ${t.type === "Income" ? "etTxIcon--income" : "etTxIcon--expense"}`} aria-hidden="true">
                          {t.type === "Income" ? <IconIncome /> : <IconExpenseNav />}
                        </div>
                        <div className="etTxMeta">
                          <div className="etTxName">{t.description}</div>
                          <div className="etTxDetail">
                            {t.category} • {t.dateISO}
                          </div>
                        </div>
                        <div className="etTxRight">
                          <div className={`etTxAmt ${t.type === "Income" ? "is-income" : ""}`}>{fmtTxAmount(t)}</div>
                          <div className="etTxActions">
                            <button type="button" className="etTxAction" onClick={() => openTxModalEdit(t)} aria-label="Edit">
                              <IconEdit />
                            </button>
                            <button
                              type="button"
                              className="etTxAction etTxAction--danger"
                              onClick={() => deleteTransaction(t.id)}
                              aria-label="Delete"
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="etTxBanner">No transactions found for {period.label.toLowerCase()}.</div>
              )}
            </div>
            <ExportExcelCard
              baseItems={txPeriod}
              filenameBase={`transactions_${period.fromISO}_to_${period.toISO}`}
              subtitle="Export the transactions list below (or choose “all transactions”)."
            />
          </>
        )}

        {section === "income" && (
          <>
            <div className="etPageHead etPageHead--row">
              <div>
                <h1 className="etPageTitle">Income</h1>
                <p className="etPageSub">Record, track, and review your income sources.</p>
              </div>
              <div className="etHeadActions">
                <div className="etSeg" role="tablist" aria-label="Timeframe">
                  {[
                    { id: "daily", label: "Daily" },
                    { id: "weekly", label: "Weekly" },
                    { id: "monthly", label: "Monthly" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      className={`etSegBtn ${timeframe === b.id ? "is-on" : ""}`}
                      onClick={() => setTimeframe(b.id)}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="etBtnPrimary"
                  onClick={() => {
                    openTxModal();
                    setTxType("Income");
                  }}
                >
                  + Add Income
                </button>
              </div>
            </div>

            <div className="etSummaryRow etSummaryRow--mini">
              <div className="etStatCard">
                <div className="etStatIcon etStatIcon--green">
                  <IconIncome />
                </div>
                <div className="etStatBody">
                  <div className="etStatLabel">Total Income</div>
                  <div className="etStatValue">{fmtMoney(totals.income)}</div>
                  <div className="etStatHint etStatHint--badge">{period.label}</div>
                </div>
              </div>
              <div className="etStatCard">
                <div className="etStatIcon etStatIcon--blue">
                  <IconSpark />
                </div>
                <div className="etStatBody">
                  <div className="etStatLabel">Income Transactions</div>
                  <div className="etStatValue">{txPeriod.filter((t) => t.type === "Income").length}</div>
                  <div className="etStatHint">{period.fromISO} → {period.toISO}</div>
                </div>
              </div>
              <div className="etStatCard">
                <div className="etStatIcon etStatIcon--teal">
                  <IconPie />
                </div>
                <div className="etStatBody">
                  <div className="etStatLabel">Top Source</div>
                  <div className="etStatValue">{incomeByCategory[0]?.[0] || "—"}</div>
                  <div className="etStatHint">{incomeByCategory[0] ? fmtMoney(incomeByCategory[0][1]) : "No income yet"}</div>
                </div>
              </div>
            </div>

            <div className="etSectionGrid">
              <div className="etPanel">
                <div className="etPanelHead">
                  <div className="etPanelTitle">Income Distribution <span className="etPanelSub">({period.label})</span></div>
                </div>
                <div className="etPanelBody">
                  {incomeTotal ? (
                    <div className="etDistGrid">
                      <div className="etDonutWrap" aria-label="Income distribution donut chart">
                        <svg className="etDonut" viewBox="0 0 44 44" role="img" aria-label="Income distribution">
                          <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(226,232,240,0.9)" strokeWidth="6" />
                          {(() => {
                            const circ = 2 * Math.PI * 18;
                            let offset = 0;
                            return incomeSegments.map((s) => {
                              const dash = (s.pct / 100) * circ;
                              const seg = (
                                <circle
                                  key={s.name}
                                  cx="22"
                                  cy="22"
                                  r="18"
                                  fill="none"
                                  stroke={s.color}
                                  strokeWidth="6"
                                  strokeLinecap="round"
                                  strokeDasharray={`${dash} ${circ - dash}`}
                                  strokeDashoffset={-offset}
                                  transform="rotate(-90 22 22)"
                                />
                              );
                              offset += dash;
                              return seg;
                            });
                          })()}
                        </svg>
                        <div className="etDonutCenter">
                          <div className="etDonutTotal">{fmtMoney(incomeTotal)}</div>
                          <div className="etDonutSub">Total income</div>
                        </div>
                      </div>

                      <div className="etDistLegend" aria-label="Legend">
                        {incomeSegments.map((s) => (
                          <div key={s.name} className="etLegendRow">
                            <span className="etLegendDot" style={{ background: s.color }} aria-hidden="true" />
                            <span className="etLegendName">{s.name}</span>
                            <span className="etLegendPct">{s.pct.toFixed(0)}%</span>
                            <span className="etLegendVal">{fmtMoney(s.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="etDistEmpty">Add income transactions to see the distribution diagram.</div>
                  )}
                </div>
              </div>

              <div className="etPanel">
                <div className="etPanelHead">
                  <div className="etPanelTitle">Recent Income <span className="etPanelSub">({period.label})</span></div>
                </div>
                <div className="etPanelBody">
                  {txPeriod.filter((t) => t.type === "Income").length ? (
                    <ul className="etTxList etTxList--tight">
                      {txPeriod
                        .filter((t) => t.type === "Income")
                        .slice()
                        .sort((a, b) => String(b.dateISO).localeCompare(String(a.dateISO)))
                        .slice(0, 8)
                        .map((t) => (
                          <li key={t.id} className="etTxItem">
                            <div className="etTxIcon" aria-hidden="true">
                              <IconIncome />
                            </div>
                            <div className="etTxMeta">
                              <div className="etTxName">{t.description}</div>
                              <div className="etTxDetail">
                                {t.category} • {t.dateISO}
                              </div>
                            </div>
                            <div className="etTxRight">
                              <div className="etTxAmt is-income">{fmtTxAmount(t)}</div>
                              <div className="etTxActions">
                                <button type="button" className="etTxAction" onClick={() => openTxModalEdit(t)}>
                                  <IconEdit />
                                </button>
                                <button type="button" className="etTxAction etTxAction--danger" onClick={() => deleteTransaction(t.id)}>
                                  <IconTrash />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <div className="etDistEmpty">No income recorded for {period.label.toLowerCase()}.</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {section === "expenses" && (
          <>
            <div className="etPageHead etPageHead--row">
              <div>
                <h1 className="etPageTitle">Expenses</h1>
                <p className="etPageSub">See where your money goes and keep spending in control.</p>
              </div>
              <div className="etHeadActions">
                <div className="etSeg" role="tablist" aria-label="Timeframe">
                  {[
                    { id: "daily", label: "Daily" },
                    { id: "weekly", label: "Weekly" },
                    { id: "monthly", label: "Monthly" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      className={`etSegBtn ${timeframe === b.id ? "is-on" : ""}`}
                      onClick={() => setTimeframe(b.id)}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="etBtnPrimary etBtnPrimary--warn"
                  onClick={() => {
                    openTxModal();
                    setTxType("Expense");
                  }}
                >
                  + Add Expense
                </button>
              </div>
            </div>

            <div className="etSummaryRow etSummaryRow--mini">
              <div className="etStatCard">
                <div className="etStatIcon etStatIcon--orange">
                  <IconExpenseNav />
                </div>
                <div className="etStatBody">
                  <div className="etStatLabel">Total Spent</div>
                  <div className="etStatValue">{fmtMoney(totals.expense)}</div>
                  <div className="etStatHint etStatHint--badge">{period.label}</div>
                </div>
              </div>
              <div className="etStatCard">
                <div className="etStatIcon etStatIcon--blue">
                  <IconSpark />
                </div>
                <div className="etStatBody">
                  <div className="etStatLabel">Expense Transactions</div>
                  <div className="etStatValue">{txPeriod.filter((t) => t.type === "Expense").length}</div>
                  <div className="etStatHint">{period.fromISO} → {period.toISO}</div>
                </div>
              </div>
              <div className="etStatCard">
                <div className="etStatIcon etStatIcon--teal">
                  <IconPie />
                </div>
                <div className="etStatBody">
                  <div className="etStatLabel">Top Category</div>
                  <div className="etStatValue">{spendByCategory[0]?.[0] || "—"}</div>
                  <div className="etStatHint">{spendByCategory[0] ? fmtMoney(spendByCategory[0][1]) : "No expenses yet"}</div>
                </div>
              </div>
            </div>

            <div className="etSectionGrid">
              <div className="etPanel">
                <div className="etPanelHead">
                  <div className="etPanelTitle">Expense Distribution <span className="etPanelSub">({period.label})</span></div>
                </div>
                <div className="etPanelBody">
                  {distTotal ? (
                    <div className="etDistGrid">
                      <div className="etDonutWrap" aria-label="Expense distribution donut chart">
                        <svg className="etDonut" viewBox="0 0 44 44" role="img" aria-label="Expense distribution">
                          <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(226,232,240,0.9)" strokeWidth="6" />
                          {(() => {
                            const circ = 2 * Math.PI * 18;
                            let offset = 0;
                            return distSegments.map((s) => {
                              const dash = (s.pct / 100) * circ;
                              const seg = (
                                <circle
                                  key={s.name}
                                  cx="22"
                                  cy="22"
                                  r="18"
                                  fill="none"
                                  stroke={s.color}
                                  strokeWidth="6"
                                  strokeLinecap="round"
                                  strokeDasharray={`${dash} ${circ - dash}`}
                                  strokeDashoffset={-offset}
                                  transform="rotate(-90 22 22)"
                                />
                              );
                              offset += dash;
                              return seg;
                            });
                          })()}
                        </svg>
                        <div className="etDonutCenter">
                          <div className="etDonutTotal">{fmtMoney(distTotal)}</div>
                          <div className="etDonutSub">Total spent</div>
                        </div>
                      </div>

                      <div className="etDistLegend" aria-label="Legend">
                        {distSegments.map((s) => (
                          <div key={s.name} className="etLegendRow">
                            <span className="etLegendDot" style={{ background: s.color }} aria-hidden="true" />
                            <span className="etLegendName">{s.name}</span>
                            <span className="etLegendPct">{s.pct.toFixed(0)}%</span>
                            <span className="etLegendVal">{fmtMoney(s.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="etDistEmpty">Add expense transactions to see the distribution diagram.</div>
                  )}
                </div>
              </div>

              <div className="etPanel">
                <div className="etPanelHead">
                  <div className="etPanelTitle">Recent Expenses <span className="etPanelSub">({period.label})</span></div>
                </div>
                <div className="etPanelBody">
                  {txPeriod.filter((t) => t.type === "Expense").length ? (
                    <ul className="etTxList etTxList--tight">
                      {txPeriod
                        .filter((t) => t.type === "Expense")
                        .slice()
                        .sort((a, b) => String(b.dateISO).localeCompare(String(a.dateISO)))
                        .slice(0, 8)
                        .map((t) => (
                          <li key={t.id} className="etTxItem">
                            <div className="etTxIcon" aria-hidden="true">
                              <IconExpenseNav />
                            </div>
                            <div className="etTxMeta">
                              <div className="etTxName">{t.description}</div>
                              <div className="etTxDetail">
                                {t.category} • {t.dateISO}
                              </div>
                            </div>
                            <div className="etTxRight">
                              <div className="etTxAmt is-expense">{fmtTxAmount(t)}</div>
                              <div className="etTxActions">
                                <button type="button" className="etTxAction" onClick={() => openTxModalEdit(t)}>
                                  <IconEdit />
                                </button>
                                <button type="button" className="etTxAction etTxAction--danger" onClick={() => deleteTransaction(t.id)}>
                                  <IconTrash />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <div className="etDistEmpty">No expenses recorded for {period.label.toLowerCase()}.</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
