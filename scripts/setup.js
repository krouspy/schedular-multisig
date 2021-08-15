const {
  TestAccountSigningKey,
  Provider,
  Signer,
} = require('@acala-network/bodhi');
const { WsProvider } = require('@polkadot/api');
const { createTestPairs } = require('@polkadot/keyring/testingPairs');
const { WS_URL } = require('./config');

const getProvider = () =>
  new Provider({
    provider: new WsProvider(WS_URL),
  });

const setup = async () => {
  const provider = getProvider();
  await provider.api.isReady;

  const pairs = createTestPairs();

  const signingKey = new TestAccountSigningKey(provider.api.registry);
  signingKey.addKeyringPair(Object.values(pairs));

  // two signers
  const alice = new Signer(provider, pairs.alice.address, signingKey);
  const bob = new Signer(provider, pairs.bob.address, signingKey);

  return {
    provider,
    alice,
    bob,
  };
};

module.exports = {
  getProvider,
  setup,
};
