// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./G9Token.sol";

contract Attacker {
    G9Token public g9Token;

    constructor(address _g9TokenAddress) {
        // The fix is to cast the address to payable before converting it to the G9Token type.
        g9Token = G9Token(payable(_g9TokenAddress));
    }

    // This function starts the attack
    function beginAttack() external {
        // We call executeWithdraw on the proposal we know exists (ID 0)
        g9Token.executeWithdraw(0);
    }

    // This receive function will be called when G9Token sends ETH.
    // It tries to call executeWithdraw AGAIN before the first call finishes.
    receive() external payable {
        // Re-entrant call. The nonReentrant modifier in G9Token should prevent this.
        if (address(g9Token).balance >= 1 ether) {
            g9Token.executeWithdraw(0);
        }
    }
}