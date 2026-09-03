import { type Chain } from "viem";

export const ritualChain: Chain = {
  id: 1979,
  name: "Ritual Chain",
  nativeCurrency: { decimals: 18, name: "RITUAL", symbol: "RITUAL" },
  rpcUrls: {
    default: { http: ["https://rpc.ritualfoundation.org"] },
    public: { http: ["https://rpc.ritualfoundation.org"] },
  },
  blockExplorers: {
    default: { name: "Ritual Explorer", url: "https://explorer.ritualfoundation.org" },
  },
};
