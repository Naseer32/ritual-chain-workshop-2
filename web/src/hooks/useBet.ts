import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { predictAbi } from "../lib/predict-abi";
import { parseEther } from "viem";

const PREDICT_ADDRESS = import.meta.env.VITE_PREDICT_ADDRESS as `0x${string}`;

export function useBet() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const bet = (marketId: bigint, isYes: boolean, amount: string) => {
    writeContract({
      address: PREDICT_ADDRESS,
      abi: predictAbi,
      functionName: "bet",
      args: [marketId, isYes],
      value: parseEther(amount),
    });
  };

  return { bet, hash, isPending, isConfirming, isSuccess, error };
}
