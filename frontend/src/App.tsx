import React, { useState, useEffect } from 'react';
import { PlusCircle, Wallet, TrendingUp, TrendingDown, PieChart, Calendar, Search } from 'lucide-react';
import axios from 'axios';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('general');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Search query state

  // Fetch transactions from API with loading state
  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions", error);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter(transaction =>
    transaction.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBalance = transactions.reduce((acc, curr) => 
    curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0
  );

  // Modified addTransaction function with loading state
  const addTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const newTransaction = {
        title,
        amount: parseFloat(amount),
        type,
        category,
        date: new Date().toISOString().split('T')[0] // Add date here if backend expects it
      };

      const response = await axios.post('http://localhost:5000/api/transactions', newTransaction);
      setTransactions(prev => [response.data, ...prev]);
      setTitle('');
      setAmount('');
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding transaction", error);
      setError("Failed to add transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-8 h-8 text-emerald-400" />
              <h1 className="text-2xl font-bold">ExpenseTracker</h1>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-all"
              disabled={isLoading}
            >
              <PlusCircle className="w-5 h-5" />
              Add Transaction
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-rose-500/20 text-rose-200 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Balance Card */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-400">Total Balance</h2>
            <PieChart className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-4xl font-bold">
            {totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="bg-slate-700/50 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={searchQuery} // Bind to searchQuery state
                onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">Loading transactions...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">No transactions found</div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      transaction.type === 'income' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
                    }`}>
                      {transaction.type === 'income' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-medium">{transaction.title}</h3>
                      <p className="text-sm text-slate-400">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {transaction.date}
                      </p>
                    </div>
                  </div>
                  <span className={`text-lg font-semibold ${
                    transaction.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Add Transaction</h2>
            <form onSubmit={addTransaction}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter title"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter amount"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setType('expense')}
                      className={`flex-1 py-2 rounded-lg ${
                        type === 'expense' ? 'bg-rose-500' : 'bg-slate-700'
                      }`}
                      disabled={isSubmitting}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('income')}
                      className={`flex-1 py-2 rounded-lg ${
                        type === 'income' ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                      disabled={isSubmitting}
                    >
                      Income
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={isSubmitting}
                  >
                    <option value="general">General</option>
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                    <option value="entertainment">Entertainment</option>
                    {/* Add more categories as needed */}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-600 px-4 py-2 rounded-lg"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 px-4 py-2 rounded-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Transaction'}
                </button>
              </div>
              {error && (
                <div className="mt-4 text-red-500">{error}</div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
