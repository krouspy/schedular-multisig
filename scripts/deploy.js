const ethers = require('ethers');
const { setup } = require('./setup');
const { getContractFactories, writeAddresses } = require('./utils');

const initialize_implementation = ethers.utils.solidityKeccak256(
  ['string'],
  ['initialize()'],
);

async function main() {
  const { provider, alice, bob } = await setup();
  const { Multisig, Proxy, StorageV1 } = await getContractFactories();

  console.log('Seploying StorageV1, Proxy and Multisig contracts...');

  const storageV1 = await StorageV1.connect(alice).deploy();
  await storageV1.deployed();

  const proxy = await Proxy.connect(alice).deploy(
    storageV1.address,
    initialize_implementation,
  );
  await proxy.deployed();
  console.log(`Implementation set to ${storageV1.address}`);

  console.log('Set signers to Alice and Bob...');
  const signers = [await alice.getAddress(), await bob.getAddress()];
  const confirmations_required = 2;

  const multisig = await Multisig.connect(alice).deploy(
    proxy.address,
    signers,
    confirmations_required,
  );
  await multisig.deployed();

  console.log('Alice transfers proxy admin role to multisig');
  await proxy.connect(alice).changeAdmin(multisig.address);

  console.log('Multisig deployed to:', multisig.address);
  console.log('Proxy deployed to:', proxy.address);
  console.log('StorageV1 deployed to:', storageV1.address);

  // write addresses to file to use them for proposal/upgrade scripts
  const data = {
    storageV1_address: storageV1.address,
    proxy_address: proxy.address,
    multisig_address: multisig.address,
  };

  console.log('Writting addresses to ./config/addresses.json');
  writeAddresses('addresses.json', data);

  await provider.api.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
