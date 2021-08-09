//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Address.sol";
import "../proxy/UpgradeabilityProxy.sol";

/*
 * MultiSig contract that allows us to manage proposals and upgrade proxy contract
 * For simplicity, we only consider proposals one at a time so creating new proposals requires the last proposal to be ended (Accepted or Refused)
 */
contract MultiSig {
    event SignerAdded(address signer);
    event ProposalCreated(uint256 id, address proposer);
    event Approval(uint256 proposalId, bool isApproved);

    enum ProposalStatus {
        ACCEPTED,
        PENDING,
        REFUSED
    }

    struct Proposal {
        address proposer;
        address implementation;
        uint8 approvals;
        ProposalStatus status;
    }

    address payable public proxy;
    address[] public signers;
    mapping(address => bool) public isSigner;
    // map address => proposalId => bool
    mapping(address => mapping(uint256 => bool)) public signerToApprovals;

    Proposal[] public proposals;

    uint8 public confirmationsRequired;

    constructor(
        address payable _proxy,
        address[] memory _signers,
        uint8 _confirmationsRequired
    ) {
        require(Address.isContract(_proxy), "proxy must be a contract");
        require(
            _confirmationsRequired <= _signers.length,
            "confirmations threshold too large"
        );

        proxy = _proxy;
        confirmationsRequired = _confirmationsRequired;

        for (uint8 i = 0; i < _signers.length; i++) {
            address signer = _signers[i];
            _addSigner(signer);
        }
    }

    modifier onlySigner() {
        require(isSigner[msg.sender], "caller is not owner");
        _;
    }

    function getSigners() external view returns (address[] memory) {
        return signers;
    }

    function addSigner(address newSigner) external onlySigner {
        _addSigner(newSigner);
    }

    function getProposal(uint256 id) external view returns (Proposal memory) {
        require(id < proposals.length, "non-existent proposal");
        return proposals[id];
    }

    /*
     * @dev Create a new proposal
     *
     * Params:
     * - implementation is the address of the new implementation to which proxy contract will point
     *
     * Requirements:
     * - Caller must be signer
     * - Last proposal must have ended
     * - Implementation must be a contract
     */
    function createProposal(address implementation) public onlySigner {
        require(!_proposalStillPending(), "last proposal not ended yet");
        require(
            Address.isContract(implementation),
            "implementation must be a contract"
        );

        Proposal memory proposal;
        proposal.proposer = msg.sender;
        proposal.implementation = implementation;
        proposal.status = ProposalStatus.PENDING;
        proposals.push(proposal);

        uint256 proposalId = proposals.length - 1;

        emit ProposalCreated(proposalId, msg.sender);
    }

    /*
     * @dev Caller approves most recent proposal
     *
     * Requirements:
     * - Caller must be signer
     * - Caller must not have approved yet
     * - Proposal must not have ended yet
     */
    function approveProposal() public onlySigner {
        require(_proposalStillPending(), "proposal already ended");

        uint256 proposalId = proposals.length - 1;

        require(
            signerToApprovals[msg.sender][proposalId] == false,
            "signer has already approved proposal"
        );

        Proposal storage proposal = proposals[proposalId];
        proposal.approvals++;

        signerToApprovals[msg.sender][proposalId] = true;

        if (proposal.approvals >= confirmationsRequired) {
            _executeProposal(proposalId);
        }

        emit Approval(proposalId, true);
    }

    /*
     * @dev Caller revokes his own approval for most recent proposal
     *
     * Requirements:
     * - Caller must be signer
     * - Caller must have already approved proposal
     * - Proposal must not have ended yet
     */
    function revokeApproval() public onlySigner {
        require(_proposalStillPending(), "proposal already ended");

        uint256 proposalId = proposals.length - 1;

        require(
            signerToApprovals[msg.sender][proposalId] == true,
            "signer has not approved proposal yet"
        );

        Proposal storage proposal = proposals[proposalId];
        proposal.approvals--;

        signerToApprovals[msg.sender][proposalId] = false;

        emit Approval(proposalId, false);
    }

    function _executeProposal(uint256 proposalId) private {
        Proposal storage proposal = proposals[proposalId];
        proposal.status = ProposalStatus.ACCEPTED;

        UpgradeabilityProxy(proxy).upgradeTo(proposal.implementation);
    }

    /*
     * @dev Check if last proposal has ended
     * if there's no proposal yet then we assume it's ended
     */
    function _proposalStillPending() private view returns (bool) {
        if (proposals.length == 0) {
            return false;
        }

        uint256 proposalId = proposals.length - 1;
        Proposal memory proposal = proposals[proposalId];
        return proposal.status == ProposalStatus.PENDING;
    }

    /*
     * @dev Caller adds a new signer
     *
     * Requirements:
     * - Caller must be signer
     * - new signer must not be address(0)
     * - new signer must not already be signer
     */
    function _addSigner(address newSigner) private {
        require(newSigner != address(0), "address must not be address(0)");
        require(!isSigner[newSigner], "address already registered as signer");

        isSigner[newSigner] = true;
        signers.push(newSigner);

        emit SignerAdded(newSigner);
    }
}
