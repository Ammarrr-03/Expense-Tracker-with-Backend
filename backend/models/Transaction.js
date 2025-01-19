import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  title: String,
  amount: Number,
  type: { type: String, enum: ['income', 'expense'] },
  category: String,
  date: Date,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
