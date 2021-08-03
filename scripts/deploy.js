const hre = require('hardhat');

async function main() {
  await hre.run('compile');

  const StorageV1 = await hre.ethers.getContractFactory('StorageV1');
  const StorageV2 = await hre.ethers.getContractFactory('StorageV2');

  const storageV1 = await StorageV1.deploy();
  const storageV2 = await StorageV2.deploy();

  await storageV1.deployed();
  await storageV2.deployed();

  console.log('StorageV1 deployed to:', storageV1.address);
  console.log('StorageV2 deployed to:', storageV2.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
