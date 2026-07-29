"use client";
import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { TrendingUp, PieChart, BarChart2 } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics({ transactions }) {
  const [gridColor, setGridColor] = useState("rgba(148, 163, 184, 0.2)");

  useEffect(() => {
    // Dynamic grid color based on theme
    const color = getComputedStyle(document.body).getPropertyValue("--border").trim() || "rgba(148, 163, 184, 0.2)";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGridColor(color);
  }, []);

  // 1. Line Chart Data (Net Worth)
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  let runningBalance = 0;
  const balanceHistory = [];
  const dateLabels = [];

  sorted.forEach((t) => {
    runningBalance += t.type === "income" ? Number(t.amount) : -Number(t.amount);
    const dateStr = new Date(t.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (dateLabels.length > 0 && dateLabels[dateLabels.length - 1] === dateStr) {
      balanceHistory[balanceHistory.length - 1] = parseFloat(runningBalance.toFixed(2));
    } else {
      dateLabels.push(dateStr);
      balanceHistory.push(parseFloat(runningBalance.toFixed(2)));
    }
  });

  const lineData = {
    labels: dateLabels.length > 0 ? dateLabels : ["No transactions"],
    datasets: [
      {
        label: "Net Worth",
        data: balanceHistory.length > 0 ? balanceHistory : [0],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.22)",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { 
        grid: { color: gridColor },
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      },
    },
  };

  // 2. Donut Chart Data (Income vs Expenses)
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  const donutData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: [parseFloat(totalIncome.toFixed(2)), parseFloat(totalExpense.toFixed(2))],
        backgroundColor: ["rgba(16, 185, 129, 0.82)", "rgba(239, 68, 68, 0.82)"],
        borderColor: ["#10b981", "#ef4444"],
      },
    ],
  };

  // 3. Bar Chart Data (Category Spending)
  const categoryMap = {};
  transactions.forEach((t) => {
    if (!categoryMap[t.category]) categoryMap[t.category] = { income: 0, expense: 0 };
    if (t.type === "income") categoryMap[t.category].income += Number(t.amount);
    else categoryMap[t.category].expense += Number(t.amount);
  });

  const catLabels = Object.keys(categoryMap);
  const incomeData = catLabels.map((c) => parseFloat(categoryMap[c].income.toFixed(2)));
  const expenseData = catLabels.map((c) => parseFloat(categoryMap[c].expense.toFixed(2)));

  const barData = {
    labels: catLabels.length > 0 ? catLabels : ["No data"],
    datasets: [
      {
        label: "Income",
        data: incomeData,
        backgroundColor: "rgba(16, 185, 129, 0.72)",
      },
      {
        label: "Expenses",
        data: expenseData,
        backgroundColor: "rgba(239, 68, 68, 0.72)",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { 
        grid: { color: gridColor }, 
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      },
    },
  };

  return (
    <section id="analytics-section" className="page-section active-section">
      <div className="page-header" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", display: "flex" }}>
        <div>
          <h2>Analytics</h2>
          <p>Visual breakdown of your finances</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label htmlFor="analytics-timeframe-select" style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Timeframe:</label>
          <select id="analytics-timeframe-select">
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <div className="analytics-card" style={{ marginBottom: 18, width: "100%" }}>
        <h3>
          <TrendingUp size={18} style={{ marginRight: 6, display: "inline-block" }} /> Net Worth Trend
        </h3>
        <div className="chart-container" style={{ height: 300 }}>
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>
            <PieChart size={18} style={{ marginRight: 6, display: "inline-block" }} /> Income vs Expenses
          </h3>
          <div className="chart-container">
            <Doughnut data={donutData} options={{ responsive: true, maintainAspectRatio: false, cutout: "68%", plugins: { legend: { display: false } } }} />
          </div>
        </div>

        <div className="analytics-card">
          <h3>
            <BarChart2 size={18} style={{ marginRight: 6, display: "inline-block" }} /> Spending by Category
          </h3>
          <div className="chart-container">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </section>
  );
}
