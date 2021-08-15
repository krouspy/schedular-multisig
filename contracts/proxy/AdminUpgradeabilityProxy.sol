//SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.4;

import "./Proxy.sol";

/*
 * This contract manages the admin role
 * The admin address is stored at slot _ADMIN_SLOT to avoid eventual conflicts with implementation contracts
 */
abstract contract AdminUpgradeabilityProxy is Proxy {
    event AdminChanged(address previousAdmin, address newAdmin);

    /*
     * @dev Storage slot for the contract admin address
     * Obtained by computing bytes32(uint256(keccak256('eip1967.proxy.admin')) - 1)
     */
    bytes32 private constant _ADMIN_SLOT =
        0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;

    constructor() public {
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

    /*
     * @dev Transfer admin to new address
     *
     * Requirements:
     * - Caller must be admin
     */
    function changeAdmin(address newAdmin) external ifAdmin {
        emit AdminChanged(_admin(), newAdmin);
        _setAdmin(newAdmin);
    }

    /*
     * @dev Get admin address from slot _ADMIN_SLOT
     */
    function _admin() private view returns (address adm) {
        bytes32 slot = _ADMIN_SLOT;
        // solhint-disable-next-line
        assembly {
            adm := sload(slot)
        }
    }

    /*
     * @dev Transfer admin to new address
     * Modify address stored at ADMIN_SLOT
     *
     * Requirements:
     * - New admin address must not be address(0)
     * - New admin address must not be address(0)
     */
    function _setAdmin(address newAdmin) private {
        require(newAdmin != address(0), "Must not be address(0)");
        require(newAdmin != _admin(), "Must not be address(0)");

        bytes32 slot = _ADMIN_SLOT;
        // solhint-disable-next-line
        assembly {
            sstore(slot, newAdmin)
        }
    }
}
