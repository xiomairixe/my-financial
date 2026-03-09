import { useState } from "react";

const AddTransactionModal = ({ onClose, onAdded, categories = [] }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    await onAdded({ description, amount: parseFloat(amount), type, category });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded" placeholder="Transaction description" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Amount</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded" placeholder="0.00" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="">Select category</option>
              {categories.map(c => <option key={c._id || c} value={c.name || c}>{c.name || c}</option>)}
            </select>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;