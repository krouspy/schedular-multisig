async function deploy(name, args = []) {
  const Contract = await ethers.getContractFactory(name);
  const contract = await Contract.deploy(...args);
  return contract.deployed();
}

async function getProxiedStorage(name, proxyAddress, signer) {
  const Contract = await ethers.getContractFactory(name);
  return new ethers.Contract(proxyAddress, Contract.interface, signer);
}

async function deployMultisig(proxy, signersAddresses, confirmationsRequired) {
  const args = [proxy, signersAddresses, confirmationsRequired];
  const multisig = await deploy('MultiSig', args);
  return multisig;
}

module.exports = {
  deploy,
  getProxiedStorage,
  deployMultisig,
};
