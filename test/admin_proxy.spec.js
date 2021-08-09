const { expect } = require('chai');
const { deploy } = require('./helpers/deploy');
const {
  initialize_implementation,
  address_zero,
} = require('./helpers/constants');

describe('Admin Proxy', function () {
  let proxy;
  let deployer;
  let newAdmin;
  let non_admin;

  beforeEach(async () => {
    [deployer, newAdmin, non_admin] = await ethers.getSigners();

    storageV1 = await deploy('StorageV1');
    proxy = await deploy('UpgradeabilityProxy', [
      storageV1.address,
      initialize_implementation,
    ]);
  });

  it('admin should be able to transfer admin role to new admin', async () => {
    const admin = await proxy.admin();
    expect(admin).to.be.equal(deployer.address);

    expect(await proxy.changeAdmin(newAdmin.address))
      .to.emit(proxy, 'AdminChanged')
      .withArgs(deployer.address, newAdmin.address);
  });

  it('can not transfer admin role to address(0)', async () => {
    const admin = await proxy.admin();
    expect(admin).to.be.equal(deployer.address);

    await expect(proxy.changeAdmin(address_zero)).to.be.reverted;
  });

  it('non-admin should not be able to modify admin', async () => {
    const admin = await proxy.admin();
    expect(admin === non_admin.address).to.be.false;

    await expect(proxy.connect(non_admin).changeAdmin(newAdmin.address)).to.be
      .reverted;
  });
});
