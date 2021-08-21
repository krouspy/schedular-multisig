const ethers = require('ethers');
const { setup } = require('./setup');
const addresses = require('./config/addresses.json');
const { getContractFactories } = require('./utils');

const { multisig_address } = addresses;

/*
 * Alice, 1 on 2 signer, creates a proposal
 * we set confirmations_required to 2 so second signer, Alice, needs to approve proposal
 * run approve-proposal.js script
 */
async function main() {
  const { provider, alice} = await setup();
  const { Multisig, StorageV2 } = await getContractFactories();

  const storageV2 = await StorageV2.connect(alice).deploy();
  await storageV2.deployed();

  const multisig = new ethers.Contract(
    multisig_address,
    Multisig.interface,
    alice,
  );

  console.log(
    `Alice (signer 1) is creating a proposal to upgrade implementation to StorageV2 ${storageV2.address}`,
  );
  const tx = await multisig.createProposal(storageV2.address);
  console.log(tx);

  await provider.api.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
