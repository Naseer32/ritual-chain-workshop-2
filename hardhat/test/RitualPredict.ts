import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { expect } from "chai";
import { network } from "hardhat";

describe("RitualPredict", function () {
  async function deploy() {
    const { viem } = await network.connect();
    const publicClient = await viem.getPublicClient();

    const scheduler = await viem.deployContract("MockScheduler");

    const predict = await viem.deployContract("RitualPredict", [
      1000n,
      scheduler.address,
    ]);

    return { viem, publicClient, predict, scheduler };
  }

  async function marketParams() {
    return {
      question: "Will ETH/USD be at least $4000?",
      oracleUrl: "https://example.com/eth",
      jsonPath: ".price",
      target: 4000n,
      comparator: 1,
      bettingSeconds: 60n,
      resolveDelaySeconds: 30n,
    };
  }

  it("creates a market with the configured oracle rule", async function () {
    const { viem, publicClient, predict } = await deploy();
    const [wallet] = await viem.getWalletClients();
    const params = await marketParams();

    await wallet.writeContract({
      address: predict.address,
      abi: predict.abi,
      functionName: "createMarket",
      args: [params],
    });

    const market = await publicClient.readContract({
      address: predict.address,
      abi: predict.abi,
      functionName: "getMarket",
      args: [1n],
    });

    expect(market.id).to.equal(1n);
    expect(market.question).to.equal(params.question);
    expect(market.oracleUrl).to.equal(params.oracleUrl);
    expect(market.jsonPath).to.equal(params.jsonPath);
    expect(market.target).to.equal(4000n);
    expect(market.comparator).to.equal(1);
    expect(market.state).to.equal(0);
    expect(market.outcome).to.equal(0);
  });

  it("schedules resolution with the expected retry settings", async function () {
    const { viem, predict, scheduler } = await deploy();
    const [wallet] = await viem.getWalletClients();
    const params = await marketParams();

    await wallet.writeContract({
      address: predict.address,
      abi: predict.abi,
      functionName: "createMarket",
      args: [params],
    });

    expect(await scheduler.read.lastNumCalls()).to.equal(3);
    expect(await scheduler.read.lastFrequency()).to.equal(200);
    expect(await scheduler.read.lastTtl()).to.equal(150);
    expect(await scheduler.read.lastGas()).to.equal(2_000_000);
    expect((await scheduler.read.lastPayer()).toLowerCase()).to.equal(predict.address.toLowerCase());
  });

  it("rejects an empty question", async function () {
    const { viem, publicClient, predict } = await deploy();
    const [wallet] = await viem.getWalletClients();
    const params = await marketParams();

    await assert.rejects(
      () =>
        wallet.writeContract({
          address: predict.address,
          abi: predict.abi,
          functionName: "createMarket",
          args: [{ ...params, question: "" }],
        }),
      /EmptyString/,
    );
  });

  it("rejects betting durations below the minimum", async function () {
    const { viem, predict } = await deploy();
    const [wallet] = await viem.getWalletClients();
    const params = await marketParams();

    await assert.rejects(
      () =>
        wallet.writeContract({
          address: predict.address,
          abi: predict.abi,
          functionName: "createMarket",
          args: [{ ...params, bettingSeconds: 10n }],
        }),
      /BadDuration/,
    );
  });

  it("tracks YES and NO stakes separately", async function () {
    const { viem, publicClient, predict } = await deploy();
    const [wallet] = await viem.getWalletClients();
    const [alice, bob] = await viem.getWalletClients();
    const params = await marketParams();

    await wallet.writeContract({
      address: predict.address,
      abi: predict.abi,
      functionName: "createMarket",
      args: [params],
    });

    await alice.writeContract({
      address: predict.address,
      abi: predict.abi,
      functionName: "bet",
      args: [1n, true],
      value: 1_000_000_000_000_000_000n,
    });

    await bob.writeContract({
      address: predict.address,
      abi: predict.abi,
      functionName: "bet",
      args: [1n, false],
      value: 2_000_000_000_000_000_000n,
    });

    const market = await publicClient.readContract({
      address: predict.address,
      abi: predict.abi,
      functionName: "getMarket",
      args: [1n],
    });

    const aliceStakes = await publicClient.readContract({
      address: predict.address,
      abi: predict.abi,
      functionName: "stakesOf",
      args: [1n, alice.account.address],
    });

    const bobStakes = await publicClient.readContract({
      address: predict.address,
      abi: predict.abi,
      functionName: "stakesOf",
      args: [1n, bob.account.address],
    });

    expect(market.totalYes).to.equal(1_000_000_000_000_000_000n);
    expect(market.totalNo).to.equal(2_000_000_000_000_000_000n);

    expect(aliceStakes[0]).to.equal(1_000_000_000_000_000_000n);
    expect(aliceStakes[1]).to.equal(0n);

    expect(bobStakes[0]).to.equal(0n);
    expect(bobStakes[1]).to.equal(2_000_000_000_000_000_000n);
  });

  it("rejects zero-value bets", async function () {
    const { viem, predict } = await deploy();
    const [wallet] = await viem.getWalletClients();
    const params = await marketParams();

    await wallet.writeContract({
      address: predict.address,
      abi: predict.abi,
      functionName: "createMarket",
      args: [params],
    });

    await assert.rejects(
      () =>
        wallet.writeContract({
          address: predict.address,
          abi: predict.abi,
          functionName: "bet",
          args: [1n, true],
          value: 0n,
        }),
      /ZeroStake/,
    );
  });
});
