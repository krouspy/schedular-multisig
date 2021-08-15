//SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.4;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";

// upgraded contract
contract StorageV2 is Initializable {
    event ValueUpdated(uint256 previousValue, uint256 newValue);

    address public creator;
    uint256 public value;

    function initialize() public initializer {
        creator = msg.sender;
    }

    function increment() public {
        uint256 newValue = value + 1;

        emit ValueUpdated(value, newValue);

        value = newValue;
    }

    function decrement() public {
        uint256 newValue = value - 1;

        emit ValueUpdated(value, newValue);

        value = newValue;
    }
}
