const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

const config_dir = 'scripts/config';

async function getContractFactories() {
  const Multisig = await hre.ethers.getContractFactory('MultiSig');
  const Proxy = await hre.ethers.getContractFactory('UpgradeabilityProxy');
  const StorageV1 = await hre.ethers.getContractFactory('StorageV1');
  const StorageV2 = await hre.ethers.getContractFactory('StorageV2');

  return {
    Multisig,
    Proxy,
    StorageV1,
    StorageV2,
  };
}

function writeAddresses(filename, data) {
  if (!fs.existsSync(config_dir)) {
    fs.mkdirSync(config_dir);
  }

  const filePath = path.join(config_dir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data));
}

module.exports = {
  getContractFactories,
  writeAddresses,
};
