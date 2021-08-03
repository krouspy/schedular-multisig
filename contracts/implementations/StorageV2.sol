//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// upgraded contract
contract StorageV2 is OwnableUpgradeable {
    event ValueUpdated(uint256 previousValue, uint256 newValue);

    uint256 public value;

    function increment() public onlyOwner {
        uint256 newValue = value + 1;

        emit ValueUpdated(value, newValue);

        value = newValue;
    }

    function decrement() public onlyOwner {
        uint256 newValue = value - 1;

        emit ValueUpdated(value, newValue);

        value = newValue;
    }
}
