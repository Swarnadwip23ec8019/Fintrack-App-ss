"use client";
import { useState, useEffect } from "react";
import { Target, Trash2 } from "lucide-react";
import { fetchSavingsGoals, addSavingsGoal, deleteSavingsGoal } from "../lib/db";

export default function Savings({ user }) {
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    target: "",
    date: ""
  });

  useEffect(() => {
    if (user) {
      fetchSavingsGoals(user.uid).then(setGoals);
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in first.");
    const newGoal = {
      name: formData.name,
      target: Number(formData.target),
      current: 0,
      date: formData.date || "No date"
    };
    const savedGoal = await addSavingsGoal(user.uid, newGoal);
    if (savedGoal) {
      setGoals([...goals, savedGoal]);
      setFormData({ name: "", target: "", date: "" });
    } else {
      alert("Failed to add goal.");
    }
  };

  const handleDelete = async (id) => {
    if (!user) return;
    const success = await deleteSavingsGoal(user.uid, id);
    if (success) {
      setGoals(goals.filter(g => g.id !== id));
    } else {
      alert("Failed to delete goal.");
    }
  };

  return (
    <section id="savings-view" className="page-section active-section">
      <div className="page-header">
        <h2>Savings Goals</h2>
        <p>Track your long-term financial targets</p>
      </div>

      <div className="form-card" style={{ marginBottom: 20 }}>
        <h3>Add Savings Goal</h3>
        <form onSubmit={handleAddGoal}>
          <div className="form-group">
            <label htmlFor="name">Goal Name</label>
            <input type="text" id="name" placeholder="e.g. New Car" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="target">Target Amount ($)</label>
            <input type="number" id="target" placeholder="0.00" min="1" value={formData.target} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="date">Target Date (Optional)</label>
            <input type="date" id="date" value={formData.date} onChange={handleInputChange} />
          </div>
          <button type="submit" className="submit-btn">+ Add Goal</button>
        </form>
      </div>

      <div className="goals-grid">
        {goals.map((goal) => {
          const progress = Math.min((goal.current / goal.target) * 100, 100);
          return (
            <div key={goal.id} className="goal-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4><Target size={16} style={{ display: "inline-block", marginRight: 6 }} /> {goal.name}</h4>
                <button className="delete-btn" onClick={() => handleDelete(goal.id)}><Trash2 size={14} /></button>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "8px 0" }}>Target: ${goal.target} by {goal.date}</p>
              
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="progress-label" style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12 }}>
                <span>${goal.current} saved</span>
                <span>{progress.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
