import { useReadContract } from "wagmi";
import { predictAbi } from "../lib/predict-abi";

const PREDICT_ADDRESS = import.meta.env.VITE_PREDICT_ADDRESS as `0x${string}`;

export function useMarkets() {
  return useReadContract({
    address: PREDICT_ADDRESS,
    abi: predictAbi,
    functionName: "getMarkets",
  });
}
