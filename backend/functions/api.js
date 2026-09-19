const express = require('express');
const serverless = require('serverless-http');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Mock in-memory database
let transactions = [];
let categories = ['Housing', 'Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Savings'];
let savingsGoals = [];

const OTP_SECRET = process.env.OTP_SECRET || 'fintrack_super_secret_otp_key';

// =====================
// AUTH / OTP API
// =====================
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set expiry to 10 minutes from now
  const expiryTime = Date.now() + 10 * 60 * 1000;
  
  // Create a hash of the email, otp, and expiry
  const data = `${email}.${otp}.${expiryTime}`;
  const hash = crypto.createHmac('sha256', OTP_SECRET).update(data).digest('hex');

  // Send Email using EmailJS REST API
  try {
    const EMAILJS_PUBLIC_KEY = "PqHBn1Bi64mEz68kd";
    const EMAILJS_SERVICE_ID = "service_a8tkha3";
    const EMAILJS_TEMPLATE_ID = "template_x3kvbms";

    if (EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
      const payload = JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: email,
          otp_code: otp,
          app_name: "FinTrack Dashboard"
        }
      });

      const options = {
        hostname: 'api.emailjs.com',
        port: 443,
        path: '/api/v1.0/email/send',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      await new Promise((resolve, reject) => {
        const req = require('https').request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve();
            } else {
              reject(new Error(`EmailJS API error: ${res.statusCode} ${data}`));
            }
          });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
      });
    } else {
      console.log(`[Mock Email] OTP for ${email} is ${otp}`);
    }
  } catch (error) {
    console.error("Failed to send email:", error.message);
    return res.status(500).json({ error: 'Failed to send OTP email: ' + error.message });
  }

  // Return the hash and expiry, but NEVER the actual OTP
  res.json({ hash, expiryTime, message: 'OTP sent successfully' });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp, hash, expiryTime } = req.body;

  if (!email || !otp || !hash || !expiryTime) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (Date.now() > expiryTime) {
    return res.status(400).json({ error: 'OTP has expired' });
  }

  const data = `${email}.${otp}.${expiryTime}`;
  const expectedHash = crypto.createHmac('sha256', OTP_SECRET).update(data).digest('hex');

  if (expectedHash === hash) {
    return res.json({ success: true, message: 'OTP verified successfully' });
  } else {
    return res.status(400).json({ error: 'Invalid OTP' });
  }
});

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
module.exports.app = app;
