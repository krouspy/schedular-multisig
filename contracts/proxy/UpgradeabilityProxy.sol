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

    constructor(address implementation_, bytes memory data_) {
        assert(
            _IMPLEMENTATION_SLOT ==
                bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1)
        );
        _upgradeToAndCall(implementation_, data_);
    }

    function implementation() public view returns (address) {
        return _implementation();
    }

    function upgradeTo(address newImplementation) public ifAdmin {
        _upgradeToAndCall(newImplementation, bytes(""));
    }

    function upgradeToAndCall(address newImplementation, bytes memory data)
        public
        ifAdmin
    {
        _upgradeToAndCall(newImplementation, data);
    }

    /*
     * @dev Returns implementation address from _IMPLEMENTATION_SLOT
     */
    function _implementation() internal view override returns (address impl) {
        bytes32 slot = _IMPLEMENTATION_SLOT;
        // solhint-disable-next-line
        assembly {
            impl := sload(slot)
        }
    }

    /*
     * @dev Modify implementation and delegate call if data is not empty
     *
     * Requirements:
     * - address must be a contract
     */
    function _upgradeToAndCall(address newImplementation, bytes memory data)
        private
    {
        _setImplementation(newImplementation);

        emit Upgraded(newImplementation);

        if (data.length > 0) {
            Address.functionDelegateCall(newImplementation, data);
        }
    }

    /*
     * @dev Modify implementation address stored at _IMPLEMENTATION_SLOT
     *
     * Requirements:
     * - newImplementation must be a contract
     * - newImplementation must be not be address(0) - verified by Address.isContract()
     */
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
