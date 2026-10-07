import "dotenv/config";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatViemPlugin from "@nomicfoundation/hardhat-viem";
import { configVariable, defineConfig } from "hardhat/config";

// Optional: path to a local soljson.js / solc binary (e.g. on Termux, where the
// downloaded native compiler cannot run). Leave unset to let Hardhat download solc.
//   SOLC_PATH=$PWD/node_modules/solc/soljson.js npx hardhat test
const solcPath = process.env.SOLC_PATH;

const solcProfile = {
  version: "0.8.28",
  ...(solcPath ? { path: solcPath } : {}),
  settings: {
    optimizer: { enabled: true, runs: 200 },
    // Ritual requests carry many fields; without viaIR this can fail with
    // "Stack too deep".
    viaIR: true,
  },
};

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin, hardhatViemPlugin],
  solidity: {
    profiles: {
      default: solcProfile,
      production: solcProfile,
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
