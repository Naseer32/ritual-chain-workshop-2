import { useReadContract } from "wagmi";
import { predictAbi } from "../lib/predict-abi";

const PREDICT_ADDRESS = import.meta.env.VITE_PREDICT_ADDRESS as `0x${string}`;

export function useMarket(marketId: bigint) {
  return useReadContract({
    address: PREDICT_ADDRESS,
    abi: predictAbi,
    functionName: "getMarket",
    args: [marketId],
  });
}
