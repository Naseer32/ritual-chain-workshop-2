import { ArrowRight, Users } from "lucide-react";
import { formatEtherValue, shortenAddress, getStateBadgeClass, MARKET_STATE_LABELS, OUTCOME_LABELS, getOutcomeColor } from "../lib/utils";

interface Props {
  market: {
    id: bigint; creator: string; question: string;
    totalYes: bigint; totalNo: bigint; state: number;
    outcome: number; closeBlock: bigint; resolveBlock: bigint;
    observedValue: bigint; target: bigint; comparator: number;
  };
  onClick: () => void;
}

export default function MarketCard({ market, onClick }: Props) {
  const total = market.totalYes + market.totalNo;
  const yesPct = total > 0n ? Number((market.totalYes * 100n) / total) : 0;
  const noPct = total > 0n ? Number((market.totalNo * 100n) / total) : 0;

  return (
    <div onClick={onClick} className="bg-gray-900/50 border border-white/5 rounded-xl p-5 cursor-pointer hover:bg-gray-800/50 transition group">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStateBadgeClass(market.state)}`}>
          {MARKET_STATE_LABELS[market.state] ?? "Unknown"}
        </span>
        {market.state === 3 && <span className={`text-sm font-bold ${getOutcomeColor(market.outcome)}`}>{OUTCOME_LABELS[market.outcome]}</span>}
      </div>
      <h3 className="font-semibold text-lg mb-4 line-clamp-2 group-hover:text-ritual-300 transition">{market.question}</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Pool</span>
          <span className="text-gray-200 font-medium">{formatEtherValue(total)} RITUAL</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-emerald-400">Yes {yesPct}%</span>
            <span className="text-rose-400">{noPct}% No</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500" style={{ width: `${yesPct}%` }} />
            <div className="bg-rose-500" style={{ width: `${noPct}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Users className="w-3.5 h-3.5" /> {shortenAddress(market.creator)}
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-ritual-400 transition" />
        </div>
      </div>
    </div>
  );
}
