const hre = require('hardhat');
const { getContractFactories, writeAddresses } = require('./utils');

const initialize_implementation = ethers.utils.solidityKeccak256(
  ['string'],
  ['initialize()'],
);

async function main() {
  await hre.run('compile');

  const [deployer, signer1, signer2] = await ethers.getSigners();
  const { Multisig, Proxy, StorageV1 } = await getContractFactories();

  const storageV1 = await StorageV1.deploy();

  await storageV1.deployed();

  const proxy = await Proxy.deploy(
    storageV1.address,
    initialize_implementation,
  );
  await proxy.deployed();

  const signers = [signer1.address, signer2.address];
  const confirmations_required = 2;
  const multisig = await Multisig.deploy(
    proxy.address,
    signers,
    confirmations_required,
  );

  console.log('deployer transfers proxy admin role to multisig');
  await proxy.changeAdmin(multisig.address);

  console.log('StorageV1 deployed to:', storageV1.address);
  console.log('Proxy deployed to:', proxy.address);
  console.log('Multisig deployed to:', multisig.address);

  // write addresses to file to use them for proposal/upgrade scripts
  const data = {
    storageV1_address: storageV1.address,
    proxy_address: proxy.address,
    multisig_address: multisig.address,
  };

  console.log('writting addresses to ./config/addresses.json');
  writeAddresses('addresses.json', data);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
