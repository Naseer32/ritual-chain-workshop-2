import { createConfig, http } from "wagmi";
import { ritualChain } from "./chains";

export const config = createConfig({
  chains: [ritualChain],
  transports: {
    [ritualChain.id]: http(import.meta.env.VITE_RITUAL_RPC_URL),
  },
});
