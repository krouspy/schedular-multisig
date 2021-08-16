const ethers = require('ethers');
const { setup } = require('./setup');
const addresses = require('./config/addresses.json');
const { getContractFactories, mineBlocks } = require('./utils');

const { proxy_address, multisig_address } = addresses;

/*
 * Approve proposal from both signers
 */
async function main() {
  const { provider, alice, bob } = await setup();
  const { Multisig, Proxy } = await getContractFactories();

  const proxy = new ethers.Contract(proxy_address, Proxy.interface, alice);
  const multisig = new ethers.Contract(
    multisig_address,
    Multisig.interface,
    alice,
  );

  const implementation_before = await proxy.implementation();

  console.log('Alice (signer 1) is approving proposal...');
  const approval_1 = await multisig.approveProposal();
  console.log(approval_1);

  console.log('Bob (signer 2) is approving proposal...');
  const approval_2 = await multisig.connect(bob).approveProposal();
  console.log(approval_2);

  console.log('Proposal accepted');
  console.log('Mining blocks to trigger scheduled call...');
  await mineBlocks(provider, alice._substrateAddress);

  const implementation_after = await proxy.implementation();
  console.log(
    `implementation upgraded from ${implementation_before} to ${implementation_after}`,
  );

  await provider.api.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
