import { useMarkets } from "../hooks/useMarkets";
import MarketCard from "./MarketCard";
import { Plus, Loader2 } from "lucide-react";

interface Props {
  onSelectMarket: (id: bigint) => void;
  onCreate: () => void;
}

export default function MarketList({ onSelectMarket, onCreate }: Props) {
  const { data: markets, isLoading, error } = useMarkets();

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-ritual-400" /></div>;
  if (error) return <div className="text-center py-20 text-red-400"><p>Failed to load markets</p><p className="text-sm text-gray-500 mt-2">{error.message}</p></div>;
  if (!markets || markets.length === 0) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-300 mb-4">No markets yet</h2>
      <p className="text-gray-500 mb-8">Be the first to create a prediction market</p>
      <button onClick={onCreate} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-ritual-600 hover:bg-ritual-500 transition font-medium">
        <Plus className="w-5 h-5" /> Create Market
      </button>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Markets</h2>
        <span className="text-sm text-gray-500">{markets.length} total</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {markets.map((m) => <MarketCard key={m.id.toString()} market={m} onClick={() => onSelectMarket(m.id)} />)}
      </div>
    </div>
  );
}
