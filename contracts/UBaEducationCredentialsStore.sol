// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UBaEducationCredentialsStore {
    address public admin;
    IERC20 public g9Token;
    uint256 public constant MIN_TOKEN_BALANCE = 10 * 10 ** 18; // 10 G9TK

    struct Credential {
        bytes32 documentHash;
        bool isVerified;
    }

    mapping(address => Credential) public credentials;

    event CredentialAdded(address indexed student, bytes32 documentHash);
    event CredentialVerified(address indexed student);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor(address _g9TokenAddress) {
        admin = msg.sender;
        g9Token = IERC20(_g9TokenAddress);
    }

    // Store hashed credential document
    function addCredential(address student, bytes32 documentHash) public onlyAdmin {
        credentials[student] = Credential(documentHash, false);
        emit CredentialAdded(student, documentHash);
    }

    // Verify credential based on token balance
    function verifyCredential(address student) public onlyAdmin {
        require(credentials[student].documentHash != 0, "Credential not found");
        require(
            g9Token.balanceOf(student) >= MIN_TOKEN_BALANCE,
            "Student does not hold enough G9 tokens"
        );
        credentials[student].isVerified = true;
        emit CredentialVerified(student);
    }

    function getCredential(address student) public view returns (
        bytes32, bool
    ) {
        Credential memory c = credentials[student];
        return (c.documentHash, c.isVerified);
    }
}
