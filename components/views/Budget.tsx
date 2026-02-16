// @ts-nocheck
import React, { useState, useMemo } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Expense } from '../../types';
import { BudgetIcon } from '../icons/Icons';

const Budget: React.FC = () => {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [currency, setCurrency] = useState('₹');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Food');
  const [budgetLimit, setBudgetLimit] = useState(50000); // Default Path Limit

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    const newExpense: Expense = {
        id: Math.random().toString(36).substr(2, 9),
        description,
        amount: parseFloat(amount),
        category,
        date: new Date().toISOString().split('T')[0],
    };
    setExpenses([...expenses, newExpense]);
    setDescription(''); setAmount('');
  };

  const { totalSpent, categoryTotals, healthStatus } = useMemo(() => {
    const totals = { Flights: 0, Accommodation: 0, Food: 0, Other: 0 };
    let total = 0;
    expenses.forEach(expense => {
      if (totals.hasOwnProperty(expense.category)) totals[expense.category] += expense.amount;
      else totals['Other'] += expense.amount;
      total += expense.amount;
    });
    
    // Financial Health Logic
    const ratio = total / budgetLimit;
    const status = ratio > 0.9 ? 'CRITICAL' : ratio > 0.7 ? 'WARNING' : 'STABLE';
    
    return { totalSpent: total, categoryTotals: totals, healthStatus: status };
  }, [expenses, budgetLimit]);

  const categories = ['Flights', 'Accommodation', 'Food', 'Other'];

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-fadeIn h-screen overflow-y-auto custom-scrollbar px-4 selection:bg-orange-500/30">
      
      {/* --- TOP FINANCIAL HUD --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 bg-[#0a0b14] border-2 border-white/5 rounded-[3.5rem] p-10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] select-none pointer-events-none">
                <h1 className="text-9xl font-black italic">VAULT</h1>
            </div>
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.6em] mb-4">Neural Capital Registry</h2>
                    <p className="text-6xl font-black text-white italic tracking-tighter">{currency}{totalSpent.toLocaleString()}</p>
                    <div className="mt-6 flex items-center gap-4">
                        <div className={`px-4 py-1 rounded-full text-[9px] font-black tracking-widest border ${healthStatus === 'STABLE' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse'}`}>
                            PATH STATUS: {healthStatus}
                        </div>
                        <span className="text-gray-600 text-[9px] font-black uppercase">Sync Latency: 12ms</span>
                    </div>
                </div>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-white/5 text-white text-[10px] font-black p-3 px-6 rounded-2xl border border-white/10 outline-none">
                    <option value="₹">INR - RAIPUR HUB</option>
                    <option value="$">USD - GLOBAL NODE</option>
                    <option value="€">EUR - EURO MESH</option>
                </select>
            </div>
        </div>

        {/* Path Limit HUD */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[3.5rem] p-10 text-white shadow-2xl flex flex-col justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Registry Limit</p>
            <div>
                <input 
                    type="number" 
                    value={budgetLimit} 
                    onChange={(e) => setBudgetLimit(Number(e.target.value))}
                    className="bg-transparent text-5xl font-black outline-none w-full italic"
                />
                <p className="text-[9px] font-black uppercase mt-2 opacity-50 underline cursor-pointer">Modify Cap</p>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2 mt-6 overflow-hidden">
                <div className="bg-white h-full transition-all duration-1000" style={{ width: `${Math.min((totalSpent/budgetLimit)*100, 100)}%` }}></div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* --- LEFT: ADD EXPENSE TERMINAL --- */}
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 shadow-3xl">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8 flex items-center gap-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>
                    Initialize Uplink
                </h3>
                <form onSubmit={handleAddExpense} className="space-y-5">
                    <div className="group">
                        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="SOURCE / DESCRIPTION" className="w-full bg-black/40 p-5 rounded-2xl text-[10px] font-black text-white outline-none border border-white/5 focus:border-orange-500 transition-all placeholder:text-gray-700" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="CREDIT/DEBIT" className="bg-black/40 p-5 rounded-2xl text-[10px] font-black text-white outline-none border border-white/5 focus:border-orange-500 transition-all placeholder:text-gray-700" />
                        <select value={category} onChange={e => setCategory(e.target.value as any)} className="bg-black/40 p-5 rounded-2xl text-[10px] font-black text-gray-500 outline-none border border-white/5">
                            {categories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="w-full py-6 bg-white text-black font-black uppercase text-[10px] tracking-[0.4em] rounded-[2rem] hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-95">
                        AUTHORIZE TRANSACTION
                    </button>
                </form>
            </div>

            {/* Category Cluster Heatmap */}
            <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8">Node Distribution</p>
                <div className="space-y-6">
                    {categories.map(cat => {
                        const perc = totalSpent > 0 ? (categoryTotals[cat] / totalSpent) * 100 : 0;
                        return (
                            <div key={cat}>
                                <div className="flex justify-between text-[9px] font-black uppercase mb-2 tracking-tighter">
                                    <span className="text-gray-400">{cat}</span>
                                    <span className="text-white">{currency}{categoryTotals[cat].toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-all duration-1000" style={{ width: `${perc}%` }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* --- RIGHT: TRANSACTION LEDGER --- */}
        <div className="lg:col-span-8">
            <div className="bg-[#0a0b14]/50 border-2 border-white/5 rounded-[4rem] p-10 h-full relative overflow-hidden shadow-inner">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-10">Neural Ledger History</h3>
                <div className="space-y-4">
                    {expenses.length > 0 ? expenses.map(expense => (
                        <div key={expense.id} className="group flex items-center justify-between p-6 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-orange-500/30 transition-all duration-500">
                            <div className="flex items-center gap-8">
                                <div className="text-2xl opacity-50 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500">
                                    {expense.category === 'Food' ? '💠' : '🌀'}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white uppercase tracking-tight italic">{expense.description}</p>
                                    <p className="text-[9px] font-bold text-gray-600 uppercase mt-1 tracking-widest">Hash: {expense.id.toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <p className="text-xl font-black text-white tracking-tighter italic">{currency}{expense.amount.toLocaleString()}</p>
                                <button onClick={() => setExpenses(expenses.filter(e => e.id !== expense.id))} className="text-gray-700 hover:text-red-500 text-xs">✕</button>
                            </div>
                        </div>
                    )) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-10">
                            <div className="text-9xl mb-4">💳</div>
                            <p className="text-xs font-black uppercase tracking-[1em]">Ledger Empty</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Budget;