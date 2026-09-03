import { useState } from "react";
import { useCreateMarket } from "../hooks/useCreateMarket";
import { ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props { onSuccess: () => void; onCancel: () => void; }

export default function CreateMarket({ onSuccess, onCancel }: Props) {
  const [form, setForm] = useState({
    question: "", oracleUrl: "", jsonPath: ".price", target: "",
    comparator: "1", bettingSeconds: "300", resolveDelaySeconds: "60",
  });
  const { create, isPending, isConfirming } = useCreateMarket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question || !form.oracleUrl || !form.jsonPath || !form.target) {
      toast.error("Fill all required fields"); return;
    }
    create({
      question: form.question, oracleUrl: form.oracleUrl, jsonPath: form.jsonPath,
      target: BigInt(form.target), comparator: parseInt(form.comparator),
      bettingSeconds: BigInt(form.bettingSeconds), resolveDelaySeconds: BigInt(form.resolveDelaySeconds),
    });
    setTimeout(onSuccess, 3000);
  };

  return (
    <div className="max-w-xl mx-auto">
      <button onClick={onCancel} className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-6">
        <ArrowLeft className="w-4 h-4" /> Cancel
      </button>
      <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-6">Create Prediction Market</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Question</label>
            <input type="text" value={form.question} onChange={(e) => setForm({...form, question: e.target.value})} placeholder="Will ETH/USD be above $4000?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-ritual-500 transition" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Oracle URL</label>
              <input type="text" value={form.oracleUrl} onChange={(e) => setForm({...form, oracleUrl: e.target.value})} placeholder="https://api.example.com/price"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-ritual-500 transition" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">JSON Path</label>
              <input type="text" value={form.jsonPath} onChange={(e) => setForm({...form, jsonPath: e.target.value})} placeholder=".price"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-ritual-500 transition" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Target Value</label>
              <input type="number" value={form.target} onChange={(e) => setForm({...form, target: e.target.value})} placeholder="4000"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-ritual-500 transition" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Comparator</label>
              <select value={form.comparator} onChange={(e) => setForm({...form, comparator: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ritual-500 transition">
                <option value="0">Greater Than (&gt;)</option>
                <option value="1">Greater or Equal (≥)</option>
                <option value="2">Less Than (&lt;)</option>
                <option value="3">Less or Equal (≤)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Betting Window (seconds)</label>
              <input type="number" value={form.bettingSeconds} onChange={(e) => setForm({...form, bettingSeconds: e.target.value})} min="30"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-ritual-500 transition" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Resolve Delay (seconds)</label>
              <input type="number" value={form.resolveDelaySeconds} onChange={(e) => setForm({...form, resolveDelaySeconds: e.target.value})} min="15"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-ritual-500 transition" />
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-sm text-gray-400 space-y-1">
            <p>• Minimum betting window: 30 seconds</p>
            <p>• Minimum resolve delay: 15 seconds</p>
            <p>• Maximum total duration: 1 day</p>
          </div>
          <button type="submit" disabled={isPending || isConfirming}
            className="w-full py-3 rounded-xl bg-ritual-600 hover:bg-ritual-500 disabled:opacity-50 transition font-medium flex items-center justify-center gap-2">
            {(isPending || isConfirming) && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? "Waiting for signature..." : isConfirming ? "Confirming..." : "Create Market"}
          </button>
        </form>
      </div>
    </div>
  );
}
