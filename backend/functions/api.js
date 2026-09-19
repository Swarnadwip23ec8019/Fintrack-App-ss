const express = require('express');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());

// Mock in-memory database
let transactions = [];
let categories = ['Housing', 'Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Savings'];
let savingsGoals = [];

// =====================
// TRANSACTIONS API
// =====================
app.get('/api/transactions', (req, res) => {
  res.json({ transactions });
});

app.post('/api/transactions', (req, res) => {
  const { amount, date, description, type, category } = req.body;
  const newTx = {
    id: Date.now().toString(),
    amount: Number(amount),
    date,
    description,
    type,
    category,
    createdAt: new Date().toISOString()
  };
  transactions.push(newTx);
  res.status(201).json(newTx);
});

app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  transactions = transactions.filter(t => t.id !== id);
  res.json({ message: 'Deleted' });
});

app.put('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const index = transactions.findIndex(t => t.id === id);
  if (index > -1) {
    transactions[index] = { ...transactions[index], ...req.body };
    res.json(transactions[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// =====================
// CATEGORIES API
// =====================
app.get('/api/categories', (req, res) => {
  res.json({ categories });
});

// Export wrapped app for Netlify Serverless Functions
module.exports.handler = serverless(app);
