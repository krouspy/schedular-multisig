//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

// contract to upgrade
contract StorageV1 is Initializable, OwnableUpgradeable {
    event ValueUpdated(uint256 previousValue, uint256 newValue);

    uint256 public value;

    function initialize() public initializer {
        __Ownable_init();
    }

    function increment() public onlyOwner {
        uint256 newValue = value + 1;

        emit ValueUpdated(value, newValue);

        value = newValue;
    }
}
