import "dotenv/config";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatViemPlugin from "@nomicfoundation/hardhat-viem";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin, hardhatViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
        path: "/data/data/com.termux/files/home/ritual-chain-workshop-2/hardhat/node_modules/.pnpm/solc@0.8.28_debug@4.4.3_supports-color@7.2.0_/node_modules/solc/soljson.js",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
      production: {
        version: "0.8.28",
        path: "/data/data/com.termux/files/home/ritual-chain-workshop-2/hardhat/node_modules/.pnpm/solc@0.8.28_debug@4.4.3_supports-color@7.2.0_/node_modules/solc/soljson.js",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    // Ritual Chain testnet. Requires EIP-1559 (type-2) transactions; viem sends
    // those by default.
    ritual: {
      type: "http",
      chainType: "l1",
      chainId: 1979,
      url: "https://rpc.ritualfoundation.org",
      accounts: [configVariable("RITUAL_PRIVATE_KEY")],
    },
  },
});
