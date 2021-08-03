const { expect } = require('chai');

describe('UpgradeabilityProxy', function () {
  let proxy;
  let storageV1;
  let deployer;
  let addr1;
  let addr2;

  beforeEach(async () => {
    [deployer, addr1, addr2] = await ethers.getSigners();

    const StorageV1 = await ethers.getContractFactory('StorageV1');
    storageV1 = await StorageV1.deploy();
    await storageV1.deployed();

    const UpgradeabilityProxy = await ethers.getContractFactory(
      'UpgradeabilityProxy',
    );
    proxy = await UpgradeabilityProxy.deploy(storageV1.address);
    await proxy.deployed();
  });

  describe('Deployment', () => {
    it('should set deployer as contract admin', async () => {
      const admin = await proxy.admin();
      expect(admin).to.be.equal(deployer.address);
    });

    it('should set implementation contract', async () => {
      const implementation = await proxy.implementation();
      expect(implementation).to.be.equal(storageV1.address);
    });
  });

  describe('Admin', () => {
    it('admin should be able to transfer admin role', async () => {
      expect(await proxy.changeAdmin(addr1.address))
        .to.emit(proxy, 'AdminChanged')
        .withArgs(deployer.address, addr1.address);

      const admin = await proxy.admin();
      expect(admin).to.be.equal(addr1.address);
    });

    it('non-admin should not be able to transfer admin role', async () => {
      await expect(proxy.connect(addr1).changeAdmin(addr2.address)).to.be
        .reverted;
    });
  });

  describe('Upgradeability', () => {
    let storageV2;
    beforeEach(async () => {
      const StorageV2 = await ethers.getContractFactory('StorageV2');
      storageV2 = await StorageV2.deploy();
      await storageV2.deployed();
    });

    it('admin should be able to upgrade implementation contract', async () => {
      expect(await proxy.upgradeTo(storageV2.address))
        .to.emit(proxy, 'Upgraded')
        .withArgs(storageV2.address);

      const implementation = await proxy.implementation();
      expect(implementation).to.be.equal(storageV2.address);
    });

    it('non-admin should not be able to upgrade implementation contract', async () => {
      await expect(proxy.connect(addr1).upgradeTo(storageV2.address)).to.be
        .reverted;
    });
  });
});
