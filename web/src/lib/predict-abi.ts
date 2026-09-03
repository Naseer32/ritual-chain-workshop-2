export const predictAbi = [
  {
    "type": "constructor",
    "inputs": [
      { "name": "blockTimeMs_", "type": "uint256" },
      { "name": "scheduler_", "type": "address" }
    ],
    "stateMutability": "nonpayable"
  },
  { "type": "receive", "stateMutability": "payable" },
  {
    "type": "function",
    "name": "createMarket",
    "inputs": [{
      "name": "p",
      "type": "tuple",
      "components": [
        { "name": "question", "type": "string" },
        { "name": "oracleUrl", "type": "string" },
        { "name": "jsonPath", "type": "string" },
        { "name": "target", "type": "uint256" },
        { "name": "comparator", "type": "uint8" },
        { "name": "bettingSeconds", "type": "uint256" },
        { "name": "resolveDelaySeconds", "type": "uint256" }
      ]
    }],
    "outputs": [{ "name": "marketId", "type": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "bet",
    "inputs": [
      { "name": "marketId", "type": "uint256" },
      { "name": "isYes", "type": "bool" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "claimWinnings",
    "inputs": [{ "name": "marketId", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claimRefund",
    "inputs": [{ "name": "marketId", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getMarket",
    "inputs": [{ "name": "marketId", "type": "uint256" }],
    "outputs": [{
      "name": "m",
      "type": "tuple",
      "components": [
        { "name": "id", "type": "uint256" },
        { "name": "creator", "type": "address" },
        { "name": "question", "type": "string" },
        { "name": "oracleUrl", "type": "string" },
        { "name": "jsonPath", "type": "string" },
        { "name": "target", "type": "uint256" },
        { "name": "comparator", "type": "uint8" },
        { "name": "closeBlock", "type": "uint64" },
        { "name": "resolveBlock", "type": "uint64" },
        { "name": "scheduleId", "type": "uint256" },
        { "name": "totalYes", "type": "uint256" },
        { "name": "totalNo", "type": "uint256" },
        { "name": "state", "type": "uint8" },
        { "name": "outcome", "type": "uint8" },
        { "name": "attempts", "type": "uint8" },
        { "name": "observedValue", "type": "uint256" },
        { "name": "invalidReason", "type": "string" }
      ]
    }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMarkets",
    "inputs": [],
    "outputs": [{
      "name": "all",
      "type": "tuple[]",
      "components": [
        { "name": "id", "type": "uint256" },
        { "name": "creator", "type": "address" },
        { "name": "question", "type": "string" },
        { "name": "oracleUrl", "type": "string" },
        { "name": "jsonPath", "type": "string" },
        { "name": "target", "type": "uint256" },
        { "name": "comparator", "type": "uint8" },
        { "name": "closeBlock", "type": "uint64" },
        { "name": "resolveBlock", "type": "uint64" },
        { "name": "scheduleId", "type": "uint256" },
        { "name": "totalYes", "type": "uint256" },
        { "name": "totalNo", "type": "uint256" },
        { "name": "state", "type": "uint8" },
        { "name": "outcome", "type": "uint8" },
        { "name": "attempts", "type": "uint8" },
        { "name": "observedValue", "type": "uint256" },
        { "name": "invalidReason", "type": "string" }
      ]
    }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "stakesOf",
    "inputs": [
      { "name": "marketId", "type": "uint256" },
      { "name": "account", "type": "address" }
    ],
    "outputs": [
      { "name": "yes", "type": "uint256" },
      { "name": "no", "type": "uint256" },
      { "name": "alreadySettled", "type": "bool" },
      { "name": "claimable", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "marketCount",
    "inputs": [],
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "blockTimeMs",
    "inputs": [],
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "scheduler",
    "inputs": [],
    "outputs": [{ "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "executionBalance",
    "inputs": [],
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "fundExecution",
    "inputs": [{ "name": "lockDurationBlocks", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "event",
    "name": "MarketCreated",
    "inputs": [
      { "name": "marketId", "type": "uint256", "indexed": true },
      { "name": "creator", "type": "address", "indexed": true },
      { "name": "question", "type": "string" },
      { "name": "closeBlock", "type": "uint64" },
      { "name": "resolveBlock", "type": "uint64" },
      { "name": "scheduleId", "type": "uint256" }
    ]
  },
  {
    "type": "event",
    "name": "BetPlaced",
    "inputs": [
      { "name": "marketId", "type": "uint256", "indexed": true },
      { "name": "bettor", "type": "address", "indexed": true },
      { "name": "isYes", "type": "bool" },
      { "name": "amount", "type": "uint256" }
    ]
  },
  {
    "type": "event",
    "name": "MarketResolved",
    "inputs": [
      { "name": "marketId", "type": "uint256", "indexed": true },
      { "name": "outcome", "type": "uint8" },
      { "name": "observedValue", "type": "uint256" }
    ]
  },
  {
    "type": "event",
    "name": "WinningsClaimed",
    "inputs": [
      { "name": "marketId", "type": "uint256", "indexed": true },
      { "name": "claimant", "type": "address", "indexed": true },
      { "name": "amount", "type": "uint256" }
    ]
  }
] as const;
