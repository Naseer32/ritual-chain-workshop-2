/**
 * Deploy RitualPredict to Ritual Chain and prepay its execution fees.
 *
 *   npx hardhat run scripts/deploy.ts
 *
 * Environment (all optional, see .env.example):
 *   RITUAL_PRIVATE_KEY   deployer key (required)
 *   RITUAL_RPC_URL       defaults to https://rpc.ritualfoundation.org
 *   BLOCK_TIME_MS        override the measured block time
 *   EXECUTION_FUNDING    RITUAL to deposit into RitualWallet (default 0.5)
 */
import { parseEther } from "viem";
import {
  RITUAL,
  RITUAL_WALLET_ABI,
  TEE_REGISTRY_ABI,
  connectRitual,
  explorerAddress,
  explorerTx,
  measureBlockTimeMs,
  ritual,
} from "./ritual.ts";

/** Blocks the RitualWallet deposit stays locked. Must comfortably outlive the demo. */
const FUNDING_LOCK_BLOCKS = 500_000n;

const { connection, publicClient, wallet, viem } = await connectRitual();
const deployer = wallet.account.address;

console.log("── Preflight ─────────────────────────────────────────────");
console.log(`Deployer:          ${deployer}`);

const nativeBalance = await publicClient.getBalance({ address: deployer });
console.log(`Native balance:    ${ritual(nativeBalance)}`);
if (nativeBalance === 0n) {
  throw new Error(`Deployer has no RITUAL. Get testnet funds at ${RITUAL.faucet}`);
}

const executorCount = await publicClient.readContract({
  address: RITUAL.teeServiceRegistry,
  abi: TEE_REGISTRY_ABI,
  functionName: "getIndexedServiceCountByCapability",
  args: [0], // HTTP_CALL
});
console.log(`HTTP executors:    ${executorCount} registered`);
if (executorCount === 0n) {
  console.warn("  ! No HTTP executors indexed — resolution will fail until some appear.");
}

const measured = await measureBlockTimeMs(publicClient, 200);
const blockTimeMs = BigInt(process.env.BLOCK_TIME_MS ?? Math.round(measured));
console.log(`Block time:        ${measured.toFixed(2)} ms measured → using ${blockTimeMs} ms`);

console.log("");
console.log("── Deploy ────────────────────────────────────────────────");

const predict = await viem.deployContract("RitualPredict", [blockTimeMs, RITUAL.scheduler]);
console.log(`RitualPredict:     ${predict.address}`);
console.log(`                   ${explorerAddress(predict.address)}`);

console.log("");
console.log("── Prepay execution fees ─────────────────────────────────");

// Every scheduled resolution (and the HTTP precompile call inside it) is paid for from
// the contract's own RitualWallet balance, because the contract is the `payer` it
// passes to Scheduler.schedule().
const funding = parseEther(process.env.EXECUTION_FUNDING ?? "0.5");
const fundHash = await predict.write.fundExecution([FUNDING_LOCK_BLOCKS], { value: funding });
await publicClient.waitForTransactionReceipt({ hash: fundHash });
console.log(`Deposited:         ${ritual(funding)}`);
console.log(`                   ${explorerTx(fundHash)}`);

const [executionBalance, lockUntil] = await Promise.all([
  publicClient.readContract({
    address: RITUAL.ritualWallet,
    abi: RITUAL_WALLET_ABI,
    functionName: "balanceOf",
    args: [predict.address],
  }),
  publicClient.readContract({
    address: RITUAL.ritualWallet,
    abi: RITUAL_WALLET_ABI,
    functionName: "lockUntil",
    args: [predict.address],
  }),
]);
console.log(`Execution balance: ${ritual(executionBalance)} (locked until block ${lockUntil})`);

console.log("");
console.log("── Next steps ────────────────────────────────────────────");
console.log("1. Expose the demo oracle publicly (the TEE executor cannot reach localhost):");
console.log("     cd web && pnpm dev");
console.log("     cloudflared tunnel --url http://localhost:3000");
console.log("2. Put these in web/.env.local:");
console.log(`     NEXT_PUBLIC_PREDICT_ADDRESS=${predict.address}`);
console.log("     NEXT_PUBLIC_DEMO_ORACLE_URL=https://<your-tunnel>/api/oracle/eth");
console.log("3. Create the demo market from the UI, or:");
console.log(`     PREDICT_ADDRESS=${predict.address} \\`);
console.log("     ORACLE_URL=https://<your-tunnel>/api/oracle/eth \\");
console.log("     npx hardhat run scripts/create-demo-market.ts");

await connection.close();
