const { expect } = require('chai');
const {
  deploy,
  getProxiedStorage,
  deployMultisig,
} = require('./helpers/deploy');
const {
  implementation_contract_names,
  initialize_implementation,
  confirmations_required,
} = require('./helpers/constants');

describe('Deployments', function () {
  let multisig;
  let proxy;
  let storageV1;
  let deployer;
  let signers;
  let signer1;
  let signer2;

  describe('Multisig', () => {
    beforeEach(async () => {
      [deployer, signer1, signer2, signer3, signer4] =
        await ethers.getSigners();

      storageV1 = await deploy('StorageV1');
      proxy = await deploy('UpgradeabilityProxy', [
        storageV1.address,
        initialize_implementation,
      ]);

      signers = [signer1, signer2];
      multisig = await deployMultisig(
        proxy.address,
        signers,
        confirmations_required,
      );
    });

    it('should set proxy address', async () => {
      expect(await multisig.proxy()).to.be.equal(proxy.address);
    });

    // initialized in constructor
    it(`confirmations required is ${confirmations_required}`, async () => {
      const confirmationsRequired = await multisig.confirmationsRequired();
      expect(confirmationsRequired).to.be.equal(confirmations_required);
    });

    it(`confirmations required should be lower than total signers`, async () => {
      const confirmationsRequired = signers.length + 1;
      await expect(
        deployMultisig(proxy.address, signers, confirmationsRequired),
      ).to.be.reverted;
    });

    it('should update signers', async () => {
      const _signers = await multisig.getSigners();
      const [_signer1, _signer2] = _signers;

      expect(_signer1).to.be.equal(signer1.address);
      expect(_signer2).to.be.equal(signer2.address);
      expect(await multisig.isSigner(signer1.address)).to.be.true;
      expect(await multisig.isSigner(signer2.address)).to.be.true;
    });

    it('signers should not be duplicated', async () => {
      const _signers = [signer1.address, signer1.address];
      await expect(
        deployMultisig(proxy.address, _signers, confirmations_required),
      ).to.be.reverted;
    });
  });

  describe('Proxy', () => {
    beforeEach(async () => {
      [deployer, signer1, signer2, signer3, signer4] =
        await ethers.getSigners();

      storageV1 = await deploy('StorageV1');
      proxy = await deploy('UpgradeabilityProxy', [
        storageV1.address,
        initialize_implementation,
      ]);
    });

    it('should set deployer as admin for proxy contract', async () => {
      const admin = await proxy.admin();
      expect(admin).to.be.equal(deployer.address);
    });

    it('should initialize implementation contract', async () => {
      const implementation = await proxy.implementation();
      expect(implementation).to.be.equal(storageV1.address);

      const storageV1Proxied = await getProxiedStorage(
        implementation_contract_names.v1,
        proxy.address,
        deployer,
      );

      // proxy delegates call so owner is deployer and not proxy
      const owner = await storageV1Proxied.creator();
      expect(owner).to.be.equal(deployer.address);

      // should not have modified value on initiliazation
      const value = await storageV1Proxied.value();
      expect(value).to.be.equal(0);
    });
  });
});
