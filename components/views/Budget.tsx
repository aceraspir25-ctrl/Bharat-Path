import React, { useState, useMemo } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Expense } from '../../types';
import { BudgetIcon } from '../icons/Icons';

const Budget: React.FC = () => {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || parseFloat(amount) <= 0) {
        setError('Please fill out all fields with valid values.');
        setTimeout(() => setError(''), 3000);
        return;
    }
    const newExpense: Expense = {
        id: new Date().toISOString(),
        description,
        amount: parseFloat(amount),
        category,
        date,
    };
    setExpenses([...expenses, newExpense]);
    // Reset form
    setDescription('');
    setAmount('');
    setCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
    setError('');
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const { totalSpent, categoryTotals } = useMemo(() => {
    const totals: { [key in Expense['category']]: number } = {
      Flights: 0,
      Accommodation: 0,
      Food: 0,
      Activities: 0,
      Other: 0,
    };
    let total = 0;
    expenses.forEach(expense => {
      if (totals.hasOwnProperty(expense.category)) {
        totals[expense.category] += expense.amount;
      }
      total += expense.amount;
    });
    return { totalSpent: total, categoryTotals: totals };
  }, [expenses]);

  const sortedExpenses = useMemo(() => {
      return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);

  const categories: Expense['category'][] = ['Flights', 'Accommodation', 'Food', 'Other'];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Travel Budget</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Keep track of your spending to stay on budget during your trip.
      </p>

      {/* Summary Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Spending Summary</h2>
        <div className="text-center mb-6">
            <p className="text-gray-500 dark:text-gray-400">Total Spent</p>
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white">₹{totalSpent.toFixed(2)}</p>
        </div>
        <div className="space-y-3">
            {categories.map(cat => {
                const percentage = totalSpent > 0 ? (categoryTotals[cat] / totalSpent) * 100 : 0;
                return (
                    <div key={cat}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat}</span>
                            <span className="text-sm font-semibold text-gray-800 dark:text-white">₹{categoryTotals[cat].toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Add Expense Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Add New Expense</h2>
        <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="description" className="label-style">Description</label>
                    <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Lunch at a cafe" className="input-field" />
                </div>
                <div>
                    <label htmlFor="amount" className="label-style">Amount (₹)</label>
                    <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 500" className="input-field" min="0" step="0.01"/>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="category" className="label-style">Category</label>
                    <select id="category" value={category} onChange={e => setCategory(e.target.value as Expense['category'])} className="input-field">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="date" className="label-style">Date</label>
                    <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" />
                </div>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg">Add Expense</button>
        </form>
         <style>{`
        .label-style { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
        .dark .label-style { color: #D1D5DB; }
        .input-field { width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; transition: border-color 0.2s, box-shadow 0.2s; }
        .dark .input-field { background-color: #374151; border-color: #4B5563; color: #F3F4F6; }
        .input-field:focus { outline: none; border-color: #F97316; box-shadow: 0 0 0 2px #FDBA74; }
      `}</style>
      </div>
      
      {/* Expense List */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Expense History</h2>
        {sortedExpenses.length > 0 ? (
            <div className="space-y-3">
                {sortedExpenses.map(expense => (
                    <div key={expense.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <p className="font-bold text-gray-800 dark:text-white">{expense.description}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{expense.category} on {new Date(expense.date + 'T00:00:00').toLocaleDateString()}</p>
                        </div>
                         <div className="flex items-center gap-4">
                            <p className="font-bold text-lg text-gray-900 dark:text-white">₹{expense.amount.toFixed(2)}</p>
                            <button onClick={() => handleRemoveExpense(expense.id)} className="text-gray-400 hover:text-red-500 font-bold text-xl">
                                &times;
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="flex justify-center text-orange-500 mb-4">
                    <BudgetIcon />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No expenses yet.</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Add your first expense to start tracking your budget.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Budget;