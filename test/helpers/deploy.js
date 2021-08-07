async function deploy(name, args = []) {
  const Contract = await ethers.getContractFactory(name);
  const contract = await Contract.deploy(...args);
  return contract.deployed();
}

async function getProxiedStorage(name, proxyAddress, signer) {
  const Contract = await ethers.getContractFactory(name);
  return new ethers.Contract(proxyAddress, Contract.interface, signer);
}

module.exports = {
  deploy,
  getProxiedStorage,
};
