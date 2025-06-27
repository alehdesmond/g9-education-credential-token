// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UBaEducationCredentialsStore is Ownable {
    IERC20 public immutable token;
    uint256 public fee;

    mapping(address => bytes32) private credentials;

    event CredentialStored(address indexed user, bytes32 documentHash);
    event FeeUpdated(uint256 newFee);

    // The fix is to call the Ownable constructor with the initial owner (the deployer).
    constructor(address _tokenAddress) Ownable(msg.sender) {
        token = IERC20(_tokenAddress);
        fee = 50 * 10**18; // Set default fee to 50 tokens
    }

    /**
     * @notice Allows a user to pay a fee in G9TK to store their credential hash.
     * @param documentHash The keccak256 hash of the user's credential document.
     */
    function addCredential(bytes32 documentHash) external {
        require(documentHash != bytes32(0), "Hash cannot be zero");
        require(credentials[msg.sender] == bytes32(0), "Credential already stored");

        // Charge the fee by transferring tokens from the user to this contract
        if (fee > 0) {
            require(token.transferFrom(msg.sender, address(this), fee), "Token transfer failed");
        }

        credentials[msg.sender] = documentHash;
        emit CredentialStored(msg.sender, documentHash);
    }

    /**
     * @notice Allows the owner to change the credential storage fee.
     * @param _newFee The new fee in the token's smallest unit (wei).
     */
    function setFee(uint256 _newFee) external onlyOwner {
        fee = _newFee;
        emit FeeUpdated(_newFee);
    }

    /**
     * @notice Allows the owner to withdraw all collected G9TK tokens from this contract.
     */
    function withdrawTokens() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        require(token.transfer(owner(), balance), "Withdrawal failed");
    }

    /**
     * @notice Public getter to view a user's stored credential hash.
     */
    function getCredentialHash(address user) external view returns (bytes32) {
        return credentials[user];
    }
}