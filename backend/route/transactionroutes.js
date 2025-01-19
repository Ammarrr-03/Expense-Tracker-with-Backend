import express from 'express';
import Transaction from '../models/Transaction.js';

const router = express.Router();
// Add this before your other routes
router.post('/test/transaction', async (req, res) => {
  try {
    const testTransaction = new Transaction({
      title: "Test Transaction",
      amount: 100,
      type: "income",
      category: "test",
      date: new Date()
    });
    
    const saved = await testTransaction.save();
    res.json(saved);
  } catch (error) {
    console.error("Test transaction error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/test/transactions', async (req, res) => {
  try {
    const allTransactions = await Transaction.find();
    res.json({ count: allTransactions.length, transactions: allTransactions });
  } catch (error) {
    console.error("Test fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    console.log('Retrieved transactions:', transactions);
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

// Add a transaction
router.post('/', async (req, res) => {
  try {
    console.log('Received transaction data:', req.body);
    
    const { title, amount, type, category } = req.body;

    // Validate required fields
    if (!title || !amount || !type || !category) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        message: "Please provide all required fields: title, amount, type, and category" 
      });
    }

    const newTransaction = new Transaction({
      title,
      amount: Number(amount),
      type,
      category,
      date: new Date()
    });

    console.log('Created new transaction object:', newTransaction);

    const savedTransaction = await newTransaction.save();
    console.log('Saved transaction:', savedTransaction);
    
    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(400).json({ message: error.message });
  }
});

export default router;