import { useAccount } from "wagmi";
import { ArrowLeft, Trophy, AlertCircle, Loader2 } from "lucide-react";
import { useMarket } from "../hooks/useMarket";
import { useClaim } from "../hooks/useClaim";
import BetForm from "./BetForm";
import { formatEtherValue, shortenAddress, getStateBadgeClass, MARKET_STATE_LABELS, OUTCOME_LABELS, getOutcomeColor, COMPARATOR_LABELS } from "../lib/utils";
import toast from "react-hot-toast";

interface Props { marketId: bigint; onBack: () => void; }

export default function MarketDetail({ marketId, onBack }: Props) {
  const { address } = useAccount();
  const { data: market, isLoading, error } = useMarket(marketId);
  const { claimWinnings, claimRefund, isPending } = useClaim();

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-ritual-400" /></div>;
  if (error || !market) return (
    <div className="text-center py-20">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <p className="text-red-400">Market not found</p>
      <button onClick={onBack} className="mt-4 text-ritual-400 hover:underline">Go back</button>
    </div>
  );

  const total = market.totalYes + market.totalNo;

  const handleClaim = () => {
    if (market.state === 3) { claimWinnings(marketId); toast.success("Claiming winnings..."); }
    else if (market.state === 4) { claimRefund(marketId); toast.success("Claiming refund..."); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to markets
      </button>
      <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 md:p-8">
        <div className="flex items-start justify-between mb-4">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStateBadgeClass(market.state)}`}>
            {MARKET_STATE_LABELS[market.state]}
          </span>
          <span className="text-xs text-gray-500">#{marketId.toString()}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">{market.question}</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Total Pool</p>
            <p className="font-semibold text-lg">{formatEtherValue(total)}</p>
            <p className="text-xs text-gray-500">RITUAL</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Yes Pool</p>
            <p className="font-semibold text-lg text-emerald-400">{formatEtherValue(market.totalYes)}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">No Pool</p>
            <p className="font-semibold text-lg text-rose-400">{formatEtherValue(market.totalNo)}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Creator</p>
            <p className="font-semibold text-sm">{shortenAddress(market.creator)}</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Resolution Rule</span>
            <span className="font-mono text-ritual-300">value {COMPARATOR_LABELS[market.comparator]} {market.target.toString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Oracle</span>
            <span className="text-xs text-gray-300 truncate max-w-[200px]">{market.oracleUrl}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">JSON Path</span>
            <span className="font-mono text-xs text-gray-300">{market.jsonPath}</span>
          </div>
        </div>

        {market.state === 3 && (
          <div className="bg-ritual-500/10 border border-ritual-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-ritual-400" />
              <div>
                <p className="font-semibold text-ritual-300">Resolved: {OUTCOME_LABELS[market.outcome]}</p>
                <p className="text-sm text-gray-400">Observed: {market.observedValue.toString()}</p>
              </div>
            </div>
          </div>
        )}

        {market.state === 4 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <p className="font-semibold text-red-300">Market Invalidated</p>
                <p className="text-sm text-gray-400">{market.invalidReason}</p>
              </div>
            </div>
          </div>
        )}

        {market.state === 0 && address && <BetForm marketId={marketId} />}
        {(market.state === 3 || market.state === 4) && address && (
          <button onClick={handleClaim} disabled={isPending} className="w-full py-3 rounded-xl bg-ritual-600 hover:bg-ritual-500 disabled:opacity-50 transition font-medium">
            {isPending ? "Processing..." : market.state === 3 ? "Claim Winnings" : "Claim Refund"}
          </button>
        )}
        {market.state === 0 && !address && <p className="text-center text-gray-500 py-4">Connect your wallet to place a bet</p>}
      </div>
    </div>
  );
}
