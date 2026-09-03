import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { predictAbi } from "../lib/predict-abi";

const PREDICT_ADDRESS = import.meta.env.VITE_PREDICT_ADDRESS as `0x${string}`;

export function useCreateMarket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const create = (params: {
    question: string; oracleUrl: string; jsonPath: string;
    target: bigint; comparator: number;
    bettingSeconds: bigint; resolveDelaySeconds: bigint;
  }) => {
    writeContract({
      address: PREDICT_ADDRESS,
      abi: predictAbi,
      functionName: "createMarket",
      args: [params],
    });
  };

  return { create, hash, isPending, isConfirming, isSuccess, error };
}
