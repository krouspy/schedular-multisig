const implementation_contract_names = {
  v1: 'StorageV1',
  v2: 'StorageV2',
};

const initialize_implementation = ethers.utils.solidityKeccak256(
  ['string'],
  ['initialize()'],
);

const address_zero = '0x0000000000000000000000000000000000000000';
const confirmations_required = 2;
const proposal_status = {
  accepted: 0,
  pending: 1,
  refused: 2,
};

module.exports = {
  implementation_contract_names,
  initialize_implementation,
  address_zero,
  confirmations_required,
  proposal_status,
};
