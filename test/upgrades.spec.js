const { expect } = require('chai');
const { deploy, getProxiedStorage } = require('./helpers/deploy');
const {
  implementation_contract_names,
  initialize_implementation,
} = require('./helpers/constants');

describe('Upgrades', function () {
  let proxy;
  let storageV1;
  let storageV2;
  let deployer;
  let addr1;

  beforeEach(async () => {
    [deployer, addr1] = await ethers.getSigners();

    storageV1 = await deploy('StorageV1');
    storageV2 = await deploy('StorageV2');
    proxy = await deploy('UpgradeabilityProxy', [
      storageV1.address,
      initialize_implementation,
    ]);
  });

  it('proxy admin should upgrade implementation address', async () => {
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

  it('proxy should keep storage', async () => {
    const proxiedStorageV1 = await getProxiedStorage(
      implementation_contract_names.v1,
      proxy.address,
      deployer,
    );

    // increment to distinguish from uint256 default value 0
    await proxiedStorageV1.increment();

    const creatorBefore = await proxiedStorageV1.creator();
    const valueBefore = Number(await proxiedStorageV1.value());

    await proxy.upgradeTo(storageV2.address);

    const proxiedStorageV2 = await getProxiedStorage(
      implementation_contract_names.v2,
      proxy.address,
      deployer,
    );

    const creatorAfter = await proxiedStorageV2.creator();
    const valueAfter = Number(await proxiedStorageV2.value());

    expect(creatorBefore).to.be.equal(creatorAfter);
    expect(valueBefore).to.be.equal(valueAfter);

    // test decrement()
    await proxiedStorageV2.decrement();

    const decrementedValue = Number(await proxiedStorageV2.value());
    expect(decrementedValue).to.be.equal(valueBefore - 1);
  });
});
