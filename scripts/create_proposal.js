const hre = require('hardhat');
const addresses = require('./config/addresses.json');
const { getContractFactories } = require('./utils');

const { proxy_address, multisig_address } = addresses;

async function main() {
  await hre.run('compile');

  const [deployer, signer1, signer2] = await ethers.getSigners();
  const { Multisig, Proxy, StorageV2 } = await getContractFactories();

  const storageV2 = await StorageV2.deploy();
  await storageV2.deployed();

  const proxy = new hre.ethers.Contract(
    proxy_address,
    Proxy.interface,
    deployer,
  );
  const multisig = new hre.ethers.Contract(
    multisig_address,
    Multisig.interface,
    signer1,
  );

  console.log('signer1 creating proposal');
  await multisig.createProposal(storageV2.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
