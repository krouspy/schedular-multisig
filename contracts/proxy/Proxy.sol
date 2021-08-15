//SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.4;

abstract contract Proxy {
    /*
     * @dev Get implementation address
     * Should override it to read implementation address in IMPLEMENTATION_SLOT
     */
    function _implementation() internal view virtual returns (address);

    /*
     * Delegates call to the Implementation contract
     * https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies#proxy-forwarding
     */
    function _fallback() internal {
        address _impl = _implementation();
        // solhint-disable-next-line
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            let result := delegatecall(gas(), _impl, ptr, calldatasize(), 0, 0)
            let size := returndatasize()
            returndatacopy(ptr, 0, size)

            switch result
            case 0 {
                revert(ptr, size)
            }
            default {
                return(ptr, size)
            }
        }
    }

    fallback() external payable {
        _fallback();
    }

    receive() external payable {
        _fallback();
    }
}
