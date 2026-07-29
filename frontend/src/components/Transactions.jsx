"use client";
import { useState, useEffect, useRef } from "react";
import { addTransaction, deleteTransaction, updateTransaction } from "../lib/db";

export default function Transactions({ user, transactions, setTransactions }) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense",
    date: "", // Will be set by useEffect to avoid hydration mismatch
    category: "Food",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);
  useEffect(() => {
    // Automatically fetch the user's current local day
    const today = new Date();
    const localDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(prev => ({ ...prev, date: localDate }));
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to manage transactions.");
      return;
    }
    const txData = { ...formData, amount: Number(formData.amount) };

    if (editingId) {
      // Update existing
      const success = await updateTransaction(user.uid, editingId, txData);
      if (success) {
        setTransactions(transactions.map(t => t.id === editingId ? { ...t, ...txData } : t));
        setEditingId(null);
      } else {
        alert("Failed to update transaction.");
        return;
      }
    } else {
      // Add new
      const newTx = await addTransaction(user.uid, txData);
      if (newTx) {
        setTransactions([newTx, ...transactions]); // Prepend for immediate UI update
      } else {
        alert("Failed to add transaction. Please try again.");
        return;
      }
    }

    // Reset form
    const today = new Date();
    const localDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    setFormData({ description: "", amount: "", type: "expense", date: localDate, category: "Food" });
  };

  const handleEdit = (tx) => {
    setEditingId(tx.id);
    setFormData({
      description: tx.description,
      amount: tx.amount,
      type: tx.type,
      date: tx.date,
      category: tx.category,
    });
    // Scroll to form
    document.getElementById("transaction-form").scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    const today = new Date();
    const localDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    setFormData({ description: "", amount: "", type: "expense", date: localDate, category: "Food" });
  };

  const handleDelete = async (id) => {
    if (!user) return;
    const success = await deleteTransaction(user.uid, id);
    if (success) {
      setTransactions(transactions.filter((t) => t.id !== id));
    } else {
      alert("Failed to delete transaction.");
    }
  };

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) {
      alert("No transactions to export.");
      return;
    }
    const headers = ["description", "amount", "type", "date", "category"];
    const csvContent = [
      headers.join(","),
      ...transactions.map(t => headers.map(h => `"${t[h] || ''}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!user) {
      alert("You must be logged in to import transactions.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length <= 1) return; // No data or just header

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const newTransactions = [];

      for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const txObj = {};
        headers.forEach((h, index) => {
          txObj[h] = currentLine[index];
        });
        
        // Basic validation
        if (txObj.description && txObj.amount && txObj.type && txObj.date && txObj.category) {
          txObj.amount = Number(txObj.amount);
          const savedTx = await addTransaction(user.uid, txObj);
          if (savedTx) newTransactions.push(savedTx);
        }
      }
      
      setTransactions([...newTransactions, ...transactions]);
      alert(`Imported ${newTransactions.length} transactions successfully.`);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const filteredTransactions = transactions.filter((t) =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="transactions-section" className="page-section active-section">
      <div className="page-header">
        <h2>Transactions</h2>
        <p>Add and manage your income & expenses</p>
      </div>

      <div className="form-card">
        <h3>{editingId ? "Edit Transaction" : "Add New Transaction"}</h3>
        <form id="transaction-form" onSubmit={handleAddTransaction} noValidate>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              placeholder="e.g. Monthly Salary"
              value={formData.description}
              onChange={handleInputChange}
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount ($)</label>
            <input
              type="number"
              id="amount"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              value={formData.amount}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select id="type" value={formData.type} onChange={handleInputChange}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input type="date" id="date" value={formData.date} onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" value={formData.category} onChange={handleInputChange}>
              <option value="Salary">Salary</option>
              <option value="Freelance">Freelance</option>
              <option value="Investment">Investment</option>
              <option value="Gift">Gift</option>
              <option value="Food">Food</option>
              <option value="Rent">Rent</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Health">Health</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="submit-btn" id="add-tx-btn" style={{ flex: 1 }}>
              {editingId ? "Update Transaction" : "+ Add Transaction"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="submit-btn" style={{ flex: 1, backgroundColor: "var(--border)", color: "var(--text-primary)" }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="list-header">
        <h3>Transaction History</h3>
        <div className="list-controls">
          <input
            type="text"
            className="search-input"
            id="search-input"
            placeholder="Search..."
            autoComplete="off"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="export-btn" id="export-csv-btn" onClick={handleExportCSV}>
            Export CSV
          </button>
          <button className="import-btn" id="import-csv-btn" onClick={() => fileInputRef.current?.click()}>
            Import CSV
          </button>
          <input 
            type="file" 
            accept=".csv" 
            style={{ display: "none" }} 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
          />
        </div>
      </div>

      <ul id="transaction-list">
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">No transactions found.</div>
        ) : (
          filteredTransactions.map((tx) => (
            <li key={tx.id} className={tx.type === "income" ? "income-item" : "expense-item"}>
              <div className="tx-info" style={{ marginLeft: 0 }}>
                <div className="tx-desc">{tx.description}</div>
                <div className="tx-meta">{tx.date}</div>
              </div>
              <span className="tx-badge">{tx.category}</span>
              <span className="tx-amount">
                 {tx.type === "income" ? "+" : "-"}${Number(tx.amount).toFixed(2)}
              </span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button className="edit-btn" aria-label="Edit transaction" onClick={() => handleEdit(tx)} style={{ background: "none", border: "none", color: "var(--primary-color)", fontSize: "13px", cursor: "pointer", padding: 0 }}>
                  Edit
                </button>
                <button className="delete-btn" aria-label="Delete transaction" onClick={() => handleDelete(tx.id)} style={{ background: "none", border: "none", color: "var(--danger-color)", fontSize: "13px", cursor: "pointer", padding: 0 }}>
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
