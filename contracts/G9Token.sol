// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title G9Token
 * @dev An ERC20 token with custom features:
 * - Users can buy tokens by sending ETH directly to the contract.
 * - Minting new tokens requires a 3-of-3 multi-signature approval.
 * - Withdrawing contract funds requires a 2-of-3 multi-signature approval.
 */
contract G9Token is ERC20, ReentrancyGuard {
    // --- State Variables ---

    address public immutable signer1;
    address public immutable signer2;
    address public immutable signer3;

    // The rate of tokens per 1 ETH (10^18 wei)
    uint256 public constant rate = 1000;

    // --- Data Structures for Multi-Signature Proposals ---

    // Proposal structure for minting new tokens
    struct MintProposal {
        address to;
        uint256 amount;
        mapping(address => bool) approvals;
        uint256 approvalCount;
        bool executed;
    }

    // Proposal structure for withdrawing ETH from the contract
    struct WithdrawProposal {
        uint256 amount;
        address payable to;
        mapping(address => bool) approvals;
        uint256 approvalCount;
        bool executed;
    }

    uint256 public mintProposalCount;
    mapping(uint256 => MintProposal) public mintProposals;

    uint256 public withdrawProposalCount;
    mapping(uint256 => WithdrawProposal) public withdrawProposals;

    // --- Events ---

    event MintProposalCreated(uint256 proposalId, address proposer, address to, uint256 amount);
    event ProposalApproved(uint256 proposalId, address approver);
    event MintExecuted(uint256 proposalId, address executor);

    event WithdrawProposalCreated(uint256 proposalId, address proposer, address to, uint256 amount);
    event WithdrawExecuted(uint256 proposalId, address executor);

    // --- Constructor ---

    constructor(address _signer1, address _signer2, address _signer3) ERC20("Group9Token", "G9TK") {
        require(_signer1 != address(0) && _signer2 != address(0) && _signer3 != address(0), "Signers cannot be zero address");
        require(_signer1 != _signer2 && _signer1 != _signer3 && _signer2 != _signer3, "Signers must be unique");
        
        signer1 = _signer1;
        signer2 = _signer2;
        signer3 = _signer3;
    }

    // --- Public Functions for Token Purchase ---

    /**
     * @dev Allows users to buy tokens by sending ETH directly to the contract.
     */
    receive() external payable {
        buyTokens();
    }

    /**
     * @dev A function to buy tokens, calculates amount based on msg.value and rate.
     */
    function buyTokens() public payable {
        require(msg.value > 0, "Must send ETH to buy tokens");
        uint256 tokensToMint = msg.value * rate;
        _mint(msg.sender, tokensToMint);
    }

    // --- Multi-Signature Minting (3-of-3) ---

    modifier onlySigner() {
        require(msg.sender == signer1 || msg.sender == signer2 || msg.sender == signer3, "Not a signer");
        _;
    }

    /**
     * @notice Step 1: A signer creates a proposal to mint tokens.
     * @param to The address to receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function proposeMint(address to, uint256 amount) public onlySigner {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than zero");

        uint256 proposalId = mintProposalCount;
        mintProposals[proposalId].to = to;
        mintProposals[proposalId].amount = amount;
        
        mintProposalCount++;
        emit MintProposalCreated(proposalId, msg.sender, to, amount);
    }

    /**
     * @notice Step 2: Other signers approve the mint proposal.
     * @param proposalId The ID of the proposal to approve.
     */
    function approveMint(uint256 proposalId) public onlySigner {
        require(proposalId < mintProposalCount, "Proposal does not exist");
        
        MintProposal storage proposal = mintProposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.approvals[msg.sender], "Already approved");

        proposal.approvals[msg.sender] = true;
        proposal.approvalCount++;
        emit ProposalApproved(proposalId, msg.sender);
    }

    /**
     * @notice Step 3: Anyone can execute the proposal once it has 3 approvals.
     * @param proposalId The ID of the proposal to execute.
     */
    function executeMint(uint256 proposalId) public {
        require(proposalId < mintProposalCount, "Proposal does not exist");
        
        MintProposal storage proposal = mintProposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(proposal.approvalCount >= 3, "Not enough approvals");

        proposal.executed = true;
        _mint(proposal.to, proposal.amount);
        emit MintExecuted(proposalId, msg.sender);
    }

    // --- Multi-Signature Withdrawal (2-of-3) ---

    /**
     * @notice Step 1: A signer creates a proposal to withdraw ETH.
     * @param amount The amount of ETH to withdraw.
     * @param to The address to send the ETH to.
     */
    function proposeWithdraw(uint256 amount, address payable to) public onlySigner {
        require(amount <= address(this).balance, "Insufficient contract balance");
        require(to != address(0), "Cannot withdraw to zero address");

        uint256 proposalId = withdrawProposalCount;
        withdrawProposals[proposalId].amount = amount;
        withdrawProposals[proposalId].to = to;

        withdrawProposalCount++;
        emit WithdrawProposalCreated(proposalId, msg.sender, to, amount);
    }

    /**
     * @notice Step 2: Other signers approve the withdrawal proposal.
     * @param proposalId The ID of the proposal to approve.
     */
    function approveWithdraw(uint256 proposalId) public onlySigner {
        require(proposalId < withdrawProposalCount, "Proposal does not exist");

        WithdrawProposal storage proposal = withdrawProposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.approvals[msg.sender], "Already approved");

        proposal.approvals[msg.sender] = true;
        proposal.approvalCount++;
        emit ProposalApproved(proposalId, msg.sender);
    }

    /**
     * @notice Step 3: Anyone can execute the proposal once it has 2 approvals.
     * @param proposalId The ID of the proposal to execute.
     */
    function executeWithdraw(uint256 proposalId) public nonReentrant {
        require(proposalId < withdrawProposalCount, "Proposal does not exist");

        WithdrawProposal storage proposal = withdrawProposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(proposal.approvalCount >= 2, "Not enough approvals");

        proposal.executed = true;
        (bool success, ) = proposal.to.call{value: proposal.amount}("");
        require(success, "ETH transfer failed");
        emit WithdrawExecuted(proposalId, msg.sender);
    }

    /**
     * @dev Returns the number of approvals for a given mint proposal.
     */
    function getMintApprovalCount(uint256 proposalId) public view returns (uint256) {
        return mintProposals[proposalId].approvalCount;
    }

    /**
     * @dev Returns the number of approvals for a given withdrawal proposal.
     */
    function getWithdrawApprovalCount(uint256 proposalId) public view returns (uint256) {
        return withdrawProposals[proposalId].approvalCount;
    }
}