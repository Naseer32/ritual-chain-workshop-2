// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * Test doubles for the Ritual precompiles / system contracts that do not exist on the
 * simulated Hardhat network. Tests deploy one of these normally, read its runtime
 * bytecode, and `setCode` it at the real address (0x0801, 0x0803, the TEE registry).
 *
 * Nothing here keeps state: behaviour is baked into the code so it survives `setCode`,
 * which copies bytecode but not storage.
 */

/// TEEServiceRegistry that always finds an executor.
contract MockTEERegistryFound {
    address public constant EXECUTOR = 0x00000000000000000000000000000000000E0E01;

    function pickServiceByCapability(uint8, bool, uint256, uint256) external pure returns (address, bool) {
        return (EXECUTOR, true);
    }
}

/// TEEServiceRegistry with no live executor.
contract MockTEERegistryEmpty {
    function pickServiceByCapability(uint8, bool, uint256, uint256) external pure returns (address, bool) {
        return (address(0), false);
    }
}

/// HTTP precompile: settled 200 response, body `{"price":4200}`.
contract MockHttpOk {
    fallback(bytes calldata) external returns (bytes memory) {
        return _envelope(200, bytes('{"price":4200}'), "");
    }

    function _envelope(uint16 status, bytes memory body, string memory err) internal pure returns (bytes memory) {
        bytes memory actual = abi.encode(status, new string[](0), new string[](0), body, err);
        return abi.encode(bytes(""), actual);
    }
}

/// HTTP precompile: result not delivered yet (empty `actualOutput`), i.e. a late answer.
contract MockHttpUnsettled {
    fallback(bytes calldata) external returns (bytes memory) {
        return abi.encode(bytes(""), bytes(""));
    }
}

/// HTTP precompile: executor answered 500.
contract MockHttpServerError {
    fallback(bytes calldata) external returns (bytes memory) {
        bytes memory actual = abi.encode(uint16(500), new string[](0), new string[](0), bytes(""), "");
        return abi.encode(bytes(""), actual);
    }
}

/// jq precompile: always extracts 4200 as a uint256.
contract MockJq {
    fallback(bytes calldata) external returns (bytes memory) {
        return abi.encode(uint256(4200));
    }
}
