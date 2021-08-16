const { expect } = require('chai');
const { deploy, deployMultisig } = require('./helpers/deploy');
const {
  confirmations_required,
  proposal_status,
  initialize_implementation,
} = require('./helpers/constants');

describe('Multisig', function () {
  let multisig;
  let deployer;
  let proxy;
  let implementationV1;
  let implementationV2;
  let signer1;
  let signer2;
  let non_signer;

  beforeEach(async () => {
    [deployer, signer1, signer2, non_signer] = await ethers.getSigners();
    const signers = [signer1.address, signer2.address];

    implementationV1 = (await deploy('StorageV1')).address;
    implementationV2 = (await deploy('StorageV2')).address;

    proxy = await deploy('UpgradeabilityProxy', [
      implementationV1,
      initialize_implementation,
    ]);

    multisig = await deployMultisig(
      proxy.address,
      signers,
      confirmations_required,
    );

    expect(await multisig.connect(signer1).createProposal(implementationV2))
      .to.emit(multisig, 'ProposalCreated')
      .withArgs(0, signer1.address);
  });

  it('signer should be able to create a proposal', async () => {
    const proposalId = 0;

    // proposal created in beforeEach()
    const [proposer, implementation, approvals, status] =
      await multisig.getProposal(proposalId);

    expect(proposer).to.be.equal(signer1.address);
    expect(implementation).to.be.equal(implementationV2);
    expect(approvals).to.be.equal(0);
    expect(status).to.be.equal(proposal_status.pending);
  });

  it('signer should be able to approve proposal', async () => {
    const proposalId = 0;

    expect(await multisig.connect(signer1).approveProposal())
      .to.emit(multisig, 'Approval')
      .withArgs(proposalId, true);

    const [proposer, implementation, approvals, status] =
      await multisig.getProposal(proposalId);

    expect(proposer).to.be.equal(signer1.address);
    expect(implementation).to.be.equal(implementationV2);
    expect(approvals).to.be.equal(1);
    expect(status).to.be.equal(proposal_status.pending);

    const hasApproved = await multisig.signerToApprovals(
      signer1.address,
      proposalId,
    );
    expect(hasApproved).to.be.true;
  });

  it('signer should be able to revoke approval', async () => {
    await multisig.connect(signer1).approveProposal();

    const proposalId = 0;

    expect(await multisig.connect(signer1).revokeApproval())
      .to.emit(multisig, 'Approval')
      .withArgs(proposalId, false);

    const [proposer, implementation, approvals, status] =
      await multisig.getProposal(proposalId);

    expect(proposer).to.be.equal(signer1.address);
    expect(implementation).to.be.equal(implementationV2);
    expect(approvals).to.be.equal(0);
    expect(status).to.be.equal(proposal_status.pending);

    const hasApproved = await multisig.signerToApprovals(
      signer1.address,
      proposalId,
    );
    expect(hasApproved).to.be.false;
  });

  /*
   * This test case will not work since we use the pre-deployed Scheduler contract from Acala
   * The contract is deployed at a specific address, check Address.sol of Acala
   * Instead the test is done directly with approve-proposal.js in scripts folder
   */
  it('should execute proposal', async () => {
    await proxy.changeAdmin(multisig.address);
    // confirmations required is set at 2
    await multisig.connect(signer1).approveProposal();

    /*
    await multisig.connect(signer2).approveProposal();

    const implementation = await proxy.implementation();
    expect(implementation).to.be.equal(implementationV2);
    */
  });

  it('signer should not be able to approve proposal again', async () => {
    await multisig.connect(signer1).approveProposal();
    await expect(multisig.connect(signer1).approveProposal()).to.be.reverted;
  });

  it('signer should not be able to revoke before approving first', async () => {
    const proposalId = 0;
    const hasApproved = await multisig.signerToApprovals(
      signer1.address,
      proposalId,
    );
    expect(hasApproved).to.be.false;
    await expect(multisig.connect(signer1).revokeApproval()).to.be.reverted;
  });

  it('signer should not be able to approve proposal again', async () => {
    await multisig.connect(signer1).approveProposal();
    await expect(multisig.connect(signer1).approveProposal()).to.be.reverted;
  });

  it('non-signer should not be able to create proposal', async () => {
    expect(await multisig.isSigner(non_signer.address)).to.be.false;
    await expect(multisig.connect(non_signer).createProposal(implementationV1))
      .to.be.reverted;
  });

  it('non-signer should not be able to approve proposal', async () => {
    expect(await multisig.isSigner(non_signer.address)).to.be.false;
    await expect(multisig.connect(non_signer).approveProposal()).to.be.reverted;
  });

  it('non-signer should not be able to revoke approval', async () => {
    expect(await multisig.isSigner(non_signer.address)).to.be.false;
    await expect(multisig.connect(non_signer).revokeApproval()).to.be.reverted;
  });
});
