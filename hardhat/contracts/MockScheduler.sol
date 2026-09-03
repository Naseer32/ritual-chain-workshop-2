// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockScheduler {
    address public approvedScheduler;

    bytes public lastData;
    uint32 public lastGas;
    uint32 public lastStartBlock;
    uint32 public lastNumCalls;
    uint32 public lastFrequency;
    uint32 public lastTtl;
    uint256 public lastMaxFeePerGas;
    uint256 public lastMaxPriorityFeePerGas;
    uint256 public lastValue;
    address public lastPayer;

    uint256 public nextCallId = 1;

    function approveScheduler(address scheduler) external {
        approvedScheduler = scheduler;
    }

    function schedule(
        bytes calldata data,
        uint32 gas,
        uint32 startBlock,
        uint32 numCalls,
        uint32 frequency,
        uint32 ttl,
        uint256 maxFeePerGas,
        uint256 maxPriorityFeePerGas,
        uint256 value,
        address payer
    ) external returns (uint256 callId) {
        lastData = data;
        lastGas = gas;
        lastStartBlock = startBlock;
        lastNumCalls = numCalls;
        lastFrequency = frequency;
        lastTtl = ttl;
        lastMaxFeePerGas = maxFeePerGas;
        lastMaxPriorityFeePerGas = maxPriorityFeePerGas;
        lastValue = value;
        lastPayer = payer;

        callId = nextCallId++;
    }

    function cancel(uint256) external {}
}
