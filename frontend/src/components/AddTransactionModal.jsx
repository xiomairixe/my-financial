import { useState } from "react";
import { X } from "lucide-react";

const AddTransactionModal = ({ onClose, onAdded, categories = [] }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ FIXED: Dinagdag ang category validation
    if (!description || !amount || !category) {
      setError("Please fill in all fields including category.");
      return;
    }

    setLoading(true);
    try {
      await onAdded({ description, amount: parseFloat(amount), type, category });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to add transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Add Transaction</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Description */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g., Grocery shopping"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            >
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c._id || c} value={c.name || c}>{c.name || c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-60"
          >
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddTransactionModal;