import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { expect } from "chai";
import { network } from "hardhat";

// Real Ritual Chain addresses (see contracts/ritual/RitualChain.sol).
const SCHEDULER = "0x56e776BAE2DD60664b69Bd5F865F1180ffB7D58B";
const HTTP_PRECOMPILE = "0x0000000000000000000000000000000000000801";
const JQ_PRECOMPILE = "0x0000000000000000000000000000000000000803";
const TEE_REGISTRY = "0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F";

// MarketState / Outcome enum values.
const State = { Open: 0, Closed: 1, Resolving: 2, Resolved: 3, Invalid: 4 };
const Outcome = { Unresolved: 0, Yes: 1, No: 2 };
const GTE = 1;
const LT = 2;

const ONE = 10n ** 18n;

describe("RitualPredict scheduled resolution (onScheduledResolve)", function () {
  async function setup(opts: { comparator?: number; bets?: "both" | "yesOnly" | "none" } = {}) {
    const { viem, networkHelpers } = await network.connect();
    const publicClient = await viem.getPublicClient();
    const [creator, alice, bob] = await viem.getWalletClients();

    const scheduler = await viem.deployContract("MockScheduler");
    const predict = await viem.deployContract("RitualPredict", [1000n, scheduler.address]);

    // Put a mock's runtime bytecode at a real Ritual address.
    async function etch(address: string, contractName: string) {
      const mock = await viem.deployContract(contractName as any);
      const code = await publicClient.getCode({ address: mock.address });
      await networkHelpers.setCode(address, code!);
    }

    // The callback only accepts the real Scheduler address.
    await networkHelpers.impersonateAccount(SCHEDULER);
    await networkHelpers.setBalance(SCHEDULER, 10n * ONE);

    await creator.writeContract({
      address: predict.address,
      abi: predict.abi,
      functionName: "createMarket",
      args: [
        {
          question: "Will ETH/USD be at least $4000?",
          oracleUrl: "https://example.com/eth",
          jsonPath: ".price",
          target: 4000n,
          comparator: opts.comparator ?? GTE,
          bettingSeconds: 60n,
          resolveDelaySeconds: 30n,
        },
      ],
    });

    const bets = opts.bets ?? "both";
    if (bets !== "none") {
      await alice.writeContract({
        address: predict.address,
        abi: predict.abi,
        functionName: "bet",
        args: [1n, true],
        value: ONE,
      });
    }
    if (bets === "both") {
      await bob.writeContract({
        address: predict.address,
        abi: predict.abi,
        functionName: "bet",
        args: [1n, false],
        value: 2n * ONE,
      });
    }

    async function market() {
      return publicClient.readContract({
        address: predict.address,
        abi: predict.abi,
        functionName: "getMarket",
        args: [1n],
      });
    }

    // Mine so the next transaction lands exactly on resolveBlock.
    async function mineToResolveBlock() {
      const m = await market();
      const now = await publicClient.getBlockNumber();
      const gap = m.resolveBlock - now - 1n;
      if (gap > 0n) await networkHelpers.mine(Number(gap));
    }

    // Simulates the Scheduler firing attempt number `index` (0, 1, 2).
    async function fire(index: bigint) {
      return predict.write.onScheduledResolve([index, 1n], { account: SCHEDULER });
    }

    async function lastFailureReason() {
      const events = await publicClient.getContractEvents({
        address: predict.address,
        abi: predict.abi,
        eventName: "ResolutionFailed",
        fromBlock: 0n,
      });
      return events.at(-1)?.args.reason;
    }

    return { viem, publicClient, networkHelpers, predict, creator, alice, bob, etch, market, mineToResolveBlock, fire, lastFailureReason };
  }

  const HAPPY = async (t: Awaited<ReturnType<typeof setup>>) => {
    await t.etch(TEE_REGISTRY, "MockTEERegistryFound");
    await t.etch(HTTP_PRECOMPILE, "MockHttpOk");
    await t.etch(JQ_PRECOMPILE, "MockJq");
  };

  // ───────────────────────── authentication ─────────────────────────

  it("rejects a callback from anyone but the Scheduler", async function () {
    const t = await setup();
    await t.mineToResolveBlock();

    await assert.rejects(
      () => t.predict.write.onScheduledResolve([0n, 1n], { account: t.alice.account }),
      /OnlyScheduler/,
    );
    expect((await t.market()).attempts).to.equal(0);
  });

  // ───────────────────────── empty / late paths ─────────────────────────

  it("EMPTY: HTTP precompile returns nothing -> 3 failed attempts -> Invalid, never hangs", async function () {
    const t = await setup();
    await t.etch(TEE_REGISTRY, "MockTEERegistryFound");
    // No code at 0x0801: the low-level call succeeds with empty return data.
    await t.mineToResolveBlock();

    await t.fire(0n);
    let m = await t.market();
    expect(m.state).to.equal(State.Resolving);
    expect(m.attempts).to.equal(1);
    expect(await t.lastFailureReason()).to.equal("HTTP precompile call failed");

    await t.fire(1n);
    m = await t.market();
    expect(m.state).to.equal(State.Resolving);
    expect(m.attempts).to.equal(2);

    await t.fire(2n);
    m = await t.market();
    expect(m.state).to.equal(State.Invalid);
    expect(m.invalidReason).to.equal("HTTP precompile call failed");
  });

  it("LATE: async output not settled yet is a failure, not a NO, and a later attempt can recover", async function () {
    const t = await setup();
    await t.etch(TEE_REGISTRY, "MockTEERegistryFound");
    await t.etch(JQ_PRECOMPILE, "MockJq");
    await t.etch(HTTP_PRECOMPILE, "MockHttpUnsettled");
    await t.mineToResolveBlock();

    await t.fire(0n);
    let m = await t.market();
    expect(m.state).to.equal(State.Resolving);
    expect(m.outcome).to.equal(Outcome.Unresolved);
    expect(await t.lastFailureReason()).to.equal("HTTP response not settled or malformed");

    // The executor's answer arrives before the next attempt.
    await t.etch(HTTP_PRECOMPILE, "MockHttpOk");
    await t.fire(1n);
    m = await t.market();
    expect(m.state).to.equal(State.Resolved);
    expect(m.outcome).to.equal(Outcome.Yes);
    expect(m.observedValue).to.equal(4200n);
  });

  it("a non-2xx executor response is a failure, not a NO", async function () {
    const t = await setup();
    await t.etch(TEE_REGISTRY, "MockTEERegistryFound");
    await t.etch(HTTP_PRECOMPILE, "MockHttpServerError");
    await t.mineToResolveBlock();

    await t.fire(0n);
    const m = await t.market();
    expect(m.state).to.equal(State.Resolving);
    expect(m.outcome).to.equal(Outcome.Unresolved);
    expect(await t.lastFailureReason()).to.equal("HTTP request returned non-2xx status");
  });

  it("no HTTP executor available is a failure and still counts as an attempt", async function () {
    const t = await setup();
    await t.etch(TEE_REGISTRY, "MockTEERegistryEmpty");
    await t.mineToResolveBlock();

    await t.fire(0n);
    const m = await t.market();
    expect(m.attempts).to.equal(1);
    expect(m.state).to.equal(State.Resolving);
    expect(await t.lastFailureReason()).to.equal("No HTTP executor available");
  });

  it("a callback before resolveBlock does nothing", async function () {
    const t = await setup();
    await HAPPY(t);

    await t.fire(0n); // still before resolveBlock
    const m = await t.market();
    expect(m.attempts).to.equal(0);
    expect(m.state).to.not.equal(State.Resolved);
  });

  // ───────────────────────── resolve + payouts ─────────────────────────

  it("resolves YES when the observed value meets the target, and pays the winner the whole pool", async function () {
    const t = await setup(); // GTE 4000, observed 4200
    await HAPPY(t);
    await t.mineToResolveBlock();

    await t.fire(0n);
    const m = await t.market();
    expect(m.state).to.equal(State.Resolved);
    expect(m.outcome).to.equal(Outcome.Yes);

    const [, , , aliceClaimable] = await t.publicClient.readContract({
      address: t.predict.address,
      abi: t.predict.abi,
      functionName: "stakesOf",
      args: [1n, t.alice.account.address],
    });
    expect(aliceClaimable).to.equal(3n * ONE); // 1 stake * 3 pool / 1 winning pool

    await t.alice.writeContract({
      address: t.predict.address,
      abi: t.predict.abi,
      functionName: "claimWinnings",
      args: [1n],
    });
    expect(await t.publicClient.getBalance({ address: t.predict.address })).to.equal(0n);

    // The loser has nothing, and the winner cannot claim twice.
    await assert.rejects(
      () => t.bob.writeContract({ address: t.predict.address, abi: t.predict.abi, functionName: "claimWinnings", args: [1n] }),
      /NothingToClaim/,
    );
    await assert.rejects(
      () => t.alice.writeContract({ address: t.predict.address, abi: t.predict.abi, functionName: "claimWinnings", args: [1n] }),
      /AlreadySettled/,
    );
  });

  it("resolves NO when the comparison fails", async function () {
    const t = await setup({ comparator: LT }); // observed 4200 < 4000 is false
    await HAPPY(t);
    await t.mineToResolveBlock();

    await t.fire(0n);
    const m = await t.market();
    expect(m.state).to.equal(State.Resolved);
    expect(m.outcome).to.equal(Outcome.No);
  });

  it("refunds everyone once all attempts fail", async function () {
    const t = await setup();
    await t.etch(TEE_REGISTRY, "MockTEERegistryFound");
    await t.mineToResolveBlock();
    for (const i of [0n, 1n, 2n]) await t.fire(i);
    expect((await t.market()).state).to.equal(State.Invalid);

    await t.alice.writeContract({ address: t.predict.address, abi: t.predict.abi, functionName: "claimRefund", args: [1n] });
    await t.bob.writeContract({ address: t.predict.address, abi: t.predict.abi, functionName: "claimRefund", args: [1n] });
    expect(await t.publicClient.getBalance({ address: t.predict.address })).to.equal(0n);

    await assert.rejects(
      () => t.alice.writeContract({ address: t.predict.address, abi: t.predict.abi, functionName: "claimRefund", args: [1n] }),
      /AlreadySettled/,
    );
  });

  it("a market with bets on one side only becomes Invalid even though the oracle answered", async function () {
    const t = await setup({ bets: "yesOnly" });
    await HAPPY(t);
    await t.mineToResolveBlock();

    await t.fire(0n);
    const m = await t.market();
    expect(m.state).to.equal(State.Invalid);
    expect(m.invalidReason).to.equal("Only one side has bets");
  });

  it("a market with no bets becomes Invalid", async function () {
    const t = await setup({ bets: "none" });
    await HAPPY(t);
    await t.mineToResolveBlock();

    await t.fire(0n);
    const m = await t.market();
    expect(m.state).to.equal(State.Invalid);
    expect(m.invalidReason).to.equal("No bets placed");
  });

  it("later Scheduler retries are no-ops once the market is final", async function () {
    const t = await setup();
    await HAPPY(t);
    await t.mineToResolveBlock();

    await t.fire(0n);
    const before = await t.market();
    expect(before.state).to.equal(State.Resolved);

    await t.fire(1n); // must not revert or change anything
    await t.fire(2n);
    const after = await t.market();
    expect(after.state).to.equal(State.Resolved);
    expect(after.attempts).to.equal(before.attempts);
    expect(after.outcome).to.equal(before.outcome);
  });
});
