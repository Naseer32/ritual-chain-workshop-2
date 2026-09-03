import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { predictAbi } from "../lib/predict-abi";

const PREDICT_ADDRESS = import.meta.env.VITE_PREDICT_ADDRESS as `0x${string}`;

export function useClaim() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const claimWinnings = (marketId: bigint) => {
    writeContract({ address: PREDICT_ADDRESS, abi: predictAbi, functionName: "claimWinnings", args: [marketId] });
  };

  const claimRefund = (marketId: bigint) => {
    writeContract({ address: PREDICT_ADDRESS, abi: predictAbi, functionName: "claimRefund", args: [marketId] });
  };

  return { claimWinnings, claimRefund, isPending, isConfirming, error };
}
