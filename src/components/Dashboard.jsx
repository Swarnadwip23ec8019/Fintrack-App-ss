"use client";
import { useState, useEffect } from "react";
import { Wallet, Banknote, TrendingUp, TrendingDown, Target, PieChart, Settings } from "lucide-react";
import { fetchBudgetLimit, setBudgetLimit, fetchSavingsGoals } from "../lib/db";

export default function Dashboard({ user, transactions, setActiveView }) {
  const [budgetLimit, setBudgetLimitState] = useState(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [savingsGoals, setSavingsGoals] = useState([]);

  useEffect(() => {
    if (user) {
      fetchBudgetLimit(user.uid).then(limit => {
        if (limit) setBudgetLimitState(limit);
      });
      fetchSavingsGoals(user.uid).then(goals => {
        setSavingsGoals(goals);
      });
    }
  }, [user]);

  const handleSetBudget = async () => {
    if (!user) return alert("Please log in first.");
    if (!budgetInput || isNaN(budgetInput)) return;
    const success = await setBudgetLimit(user.uid, budgetInput);
    if (success) {
      setBudgetLimitState(Number(budgetInput));
      setBudgetInput("");
      alert("Budget limit set successfully!");
    } else {
      alert("Failed to set budget limit.");
    }
  };
  // Calculate totals
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalBalance = totalIncome - totalExpense;

  return (
    <section id="dashboard-section" className="page-section active-section">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Your financial overview at a glance</p>
      </div>

      {/* Summary Cards */}
      <div className="widget-container">
        <div className="card balance-card">
          <div className="card-icon"><Wallet size={24} /></div>
          <h3>Total Net Worth</h3>
          <p className="amount">${totalBalance.toFixed(2)}</p>
        </div>

        <div className="card liquid-card">
          <div className="card-icon"><Banknote size={24} /></div>
          <h3>Available Cash</h3>
          <p className="amount">${totalBalance.toFixed(2)}</p>
        </div>

        <div className="card income-card">
          <div className="card-icon"><TrendingUp size={24} /></div>
          <h3>Total Income</h3>
          <p className="amount">${totalIncome.toFixed(2)}</p>
        </div>

        <div className="card expense-card">
          <div className="card-icon"><TrendingDown size={24} /></div>
          <h3>Total Expenses</h3>
          <p className="amount">${totalExpense.toFixed(2)}</p>
        </div>
      </div>

      {/* Budget Goal Widget */}
      <div className="budget-card">
        <div className="budget-card-header">
          <span><Target size={20} /></span>
          <h3>Monthly Budget Goal</h3>
        </div>
        <div className="budget-input-row">
          <input
            type="number"
            placeholder="Set monthly spending limit (e.g. 2000)"
            min="1"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            style={{ flex: 1, padding: "10px 14px", background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)" }}
          />
          <button className="submit-btn" style={{ padding: "10px 20px" }} onClick={handleSetBudget}>Set Goal</button>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${budgetLimit ? Math.min((totalExpense / budgetLimit) * 100, 100) : 0}%` }}></div>
        </div>
        <div className="progress-label" style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 8, color: "var(--text-secondary)" }}>
          <span>${totalExpense.toFixed(2)} spent</span>
          <span>Goal: {budgetLimit ? `$${budgetLimit.toFixed(2)}` : "Not set"}</span>
        </div>
      </div>

      <div className="dashboard-grid-two-col">
        <div className="dashboard-widget-card">
          <div className="widget-card-header">
            <span><PieChart size={20} /></span>
            <h3>Category Budgets</h3>
            <button className="widget-action-btn" style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={() => alert("Category budgets management coming soon!")}>
              <Settings size={14} /> Manage
            </button>
          </div>
          <div className="widget-list">
             <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>No category budgets configured. Click manage to set limits!</p>
          </div>
        </div>
        <div className="dashboard-widget-card">
          <div className="widget-card-header">
            <span><Target size={20} /></span>
            <h3>Savings Goals</h3>
            <button className="widget-action-btn" onClick={() => setActiveView("savings")}>+ Add Goal</button>
          </div>
          <div className="widget-list">
            {savingsGoals.length === 0 ? (
               <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>No savings goals set. Time to dream big!</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, marginTop: 10 }}>
                {savingsGoals.map(g => (
                  <li key={g.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 14 }}>{g.name}</span>
                    <span style={{ fontSize: 14, fontWeight: "bold" }}>${g.current} / ${g.target}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
