const ethers = require('ethers');
const {
  Provider,
  Signer,
  TestAccountSigningKey,
} = require('@acala-network/bodhi');
const { WsProvider, Keyring } = require('@polkadot/api');
const { createTestPairs } = require('@polkadot/keyring/testingPairs');
const StorageV1 = require('../build/StorageV1.json');

const WS_URL = 'ws://127.0.0.1:9944';

async function setup() {
  const provider = new Provider({
    provider: new WsProvider(WS_URL),
  });

  await provider.api.isReady;

  const testPairs = createTestPairs();
  const pair = testPairs.alice;

  const signingKey = new TestAccountSigningKey(provider.api.registry);
  signingKey.addKeyringPair(pair);

  const wallet = new Signer(provider, pair.address, signingKey);
  return { provider, wallet };
}

async function main() {
  const { provider, wallet } = await setup();
  const deployerAddress = await wallet.getAddress();

  const factory = await ethers.ContractFactory.fromSolidity(StorageV1)
    .connect(wallet)
    .deploy();

  console.log(factory);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await provider.api.disconnect();
    process.exit();
  });
