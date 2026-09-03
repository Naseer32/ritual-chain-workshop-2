import { useState } from "react";
import { useBet } from "../hooks/useBet";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props { marketId: bigint; }

export default function BetForm({ marketId }: Props) {
  const [amount, setAmount] = useState("");
  const [side, setSide] = useState<"yes" | "no">("yes");
  const { bet, isPending, isConfirming } = useBet();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) { toast.error("Enter a valid amount"); return; }
    bet(marketId, side === "yes", amount);
    toast.success(`Betting ${amount} RITUAL on ${side.toUpperCase()}`);
  };

  const loading = isPending || isConfirming;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <button type="button" onClick={() => setSide("yes")}
          className={`flex-1 py-3 rounded-xl font-medium transition ${side === "yes" ? "bg-emerald-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
          Yes
        </button>
        <button type="button" onClick={() => setSide("no")}
          className={`flex-1 py-3 rounded-xl font-medium transition ${side === "no" ? "bg-rose-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
          No
        </button>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-2">Amount (RITUAL)</label>
        <input type="number" step="0.001" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.1"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-ritual-500 transition" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl bg-ritual-600 hover:bg-ritual-500 disabled:opacity-50 transition font-medium flex items-center justify-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Confirming..." : `Bet on ${side.toUpperCase()}`}
      </button>
    </form>
  );
}
