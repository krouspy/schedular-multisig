const { expect } = require('chai');
const { deploy, getProxiedStorage } = require('./helpers/deploy');
const {
  implementation_contract_names,
  initialize_implementation,
} = require('./helpers/constants');

describe('Deployments', function () {
  let proxy;
  let storageV1;
  let deployer;

  beforeEach(async () => {
    [deployer] = await ethers.getSigners();

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

    // check if value has still the default value
    const value = await storageV1Proxied.value();
    expect(value).to.be.equal(0);
  });
});
