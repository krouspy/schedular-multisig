const implementation_contract_names = {
  v1: 'StorageV1',
  v2: 'StorageV2',
};

const initialize_implementation = ethers.utils.solidityKeccak256(
  ['string'],
  ['initialize()'],
);

module.exports = {
  implementation_contract_names,
  initialize_implementation,
};
