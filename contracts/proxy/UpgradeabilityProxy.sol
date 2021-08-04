//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Address.sol";
import "./AdminUpgradeabilityProxy.sol";

/**
 * https://eips.ethereum.org/EIPS/eip-1967
 */
contract UpgradeabilityProxy is AdminUpgradeabilityProxy {
    event Upgraded(address implementation);

    /*
     * @dev Storage slot for the logic contract - To avoid clashing between Proxy and Logic contracts
     * Obtained by computing bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)
     */
    bytes32 private constant _IMPLEMENTATION_SLOT =
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    constructor(address implementation_) {
        assert(
            _IMPLEMENTATION_SLOT ==
                bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1)
        );
        _setImplementation(implementation_);
    }

    function implementation() public view returns (address) {
        return _implementation();
    }

    function upgradeTo(address newImplementation) public ifAdmin {
        _setImplementation(newImplementation);
        emit Upgraded(newImplementation);
    }

    function _implementation() internal view override returns (address impl) {
        bytes32 slot = _IMPLEMENTATION_SLOT;
        // solhint-disable-next-line
        assembly {
            impl := sload(slot)
        }
    }

    function _setImplementation(address newImplementation) private {
        require(
            Address.isContract(newImplementation),
            "Must be a contract address"
        );
        bytes32 slot = _IMPLEMENTATION_SLOT;

        // solhint-disable-next-line
        assembly {
            sstore(slot, newImplementation)
        }
    }
}
