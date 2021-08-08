//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

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
        uint8 approvals;
        ProposalStatus status;
    }

    address[] public signers;
    mapping(address => bool) public isSigner;
    // map address => proposalId => bool
    mapping(address => mapping(uint256 => bool)) public signerToApprovals;

    Proposal[] public proposals;

    uint8 public confirmationsRequired;

    constructor(address[] memory _signers, uint8 _confirmationsRequired) {
        require(
            _confirmationsRequired <= _signers.length,
            "confirmations threshold too large"
        );

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
     * @dev Create a proposal only if caller is signer and last proposal is over
     */
    function createProposal() public onlySigner {
        require(_lastProposalEnded(), "last proposal has not ended");

        Proposal memory proposal;
        proposal.proposer = msg.sender;
        proposal.status = ProposalStatus.PENDING;
        proposals.push(proposal);

        uint256 proposalId = proposals.length - 1;

        emit ProposalCreated(proposalId, msg.sender);
    }

    /*
     * @dev Approve a proposal only if caller is signer and last proposal in over
     */
    function approveProposal(uint256 proposalId) public onlySigner {
        require(!_proposalEnded(proposalId), "proposal is over");
        require(
            signerToApprovals[msg.sender][proposalId] == false,
            "signer has already approved proposal"
        );

        Proposal storage proposal = proposals[proposalId];
        proposal.approvals++;

        signerToApprovals[msg.sender][proposalId] = true;

        emit Approval(proposalId, true);
    }

    /*
     * @dev Revoke caller own approval
     * Proposal must be pending and caller must have already approved before
     */
    function revokeApproval(uint256 proposalId) public onlySigner {
        require(!_proposalEnded(proposalId), "proposal is over");
        require(
            signerToApprovals[msg.sender][proposalId] == true,
            "signer has not approved proposal yet"
        );

        Proposal storage proposal = proposals[proposalId];
        proposal.approvals--;

        signerToApprovals[msg.sender][proposalId] = false;

        emit Approval(proposalId, false);
    }

    /*
     * @dev Check if last proposal has ended
     * if there's no proposal yet then we assume it's ended
     */
    function _lastProposalEnded() private view returns (bool) {
        if (proposals.length == 0) {
            return true;
        }
        uint256 proposalId = proposals.length - 1;
        return _proposalEnded(proposalId);
    }

    function _proposalEnded(uint256 proposalId) private view returns (bool) {
        Proposal memory proposal = proposals[proposalId];
        return proposal.status != ProposalStatus.PENDING;
    }

    function _addSigner(address newSigner) private {
        require(newSigner != address(0), "address must not be address(0)");
        require(!isSigner[newSigner], "address already registered as signer");

        isSigner[newSigner] = true;
        signers.push(newSigner);

        emit SignerAdded(newSigner);
    }
}
