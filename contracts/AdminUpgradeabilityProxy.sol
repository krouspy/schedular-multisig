//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "./Proxy.sol";

// https://eips.ethereum.org/EIPS/eip-1967
abstract contract AdminUpgradeabilityProxy is Proxy {
    event AdminChanged(address previousAdmin, address newAdmin);

    /*
     * @dev Storage slot for the contract admin address - To avoid clashing between Proxy and Logic contracts
     * Obtained by computing bytes32(uint256(keccak256('eip1967.proxy.admin')) - 1)
     */
    bytes32 private constant _ADMIN_SLOT =
        0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;

    constructor() {
        assert(
            _ADMIN_SLOT ==
                bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1)
        );
        _setAdmin(msg.sender);
    }

    /*
     * Check if msg.sender is admin
     * Otherwise, delegates to Implementation contract
     */
    modifier ifAdmin() {
        if (msg.sender == _admin()) {
            _;
        } else {
            _fallback();
        }
    }

    function admin() external view returns (address) {
        return _admin();
    }

    function changeAdmin(address newAdmin) external ifAdmin {
        require(newAdmin != address(0), "Must not be address(0)");
        emit AdminChanged(_admin(), newAdmin);
        _setAdmin(newAdmin);
    }

    function _admin() private view returns (address adm) {
        bytes32 slot = _ADMIN_SLOT;
        // solhint-disable-next-line
        assembly {
            adm := sload(slot)
        }
    }

    function _setAdmin(address newAdmin) private {
        bytes32 slot = _ADMIN_SLOT;
        // solhint-disable-next-line
        assembly {
            sstore(slot, newAdmin)
        }
    }
}
