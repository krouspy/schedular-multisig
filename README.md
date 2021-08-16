## Overview

This repository contains an Upgradeable contract behind a Multisig contract. Multisig signers can propose upgrades and approve them. Once the total approvals reaches the confirmations required, a scheduled call is created to upgrade the contract and triggered after 3 blocks.

## Environment

Ubuntu 20.04 LTS
Docker v20.10.8
Node v16.5.0

## Installation

Install dependencies

```
$ yarn
```

Compile contracts

```
$ yarn compile
```

Run tests

```
$ yarn test
```

Lint contracts

```
$ yarn lint
```

## Usage

Scripts have been placed in the `scripts/` folder to show how to use the contracts, from deployment to approval of proposal.
For simplicity, we use 2 signers and 2 required approvals.

We will work on top of an Acala local testnet.

```
$ docker run --rm -p 9944:9944 acala/mandala-node:latest --dev --ws-external --rpc-methods=unsafe --instant-sealing  -levm=trace
```

Deploy our contracts

```
$ yarn deploy
```

Create a proposal to upgrade implementation from StorageV1 to StorageV2.

```
$ yarn create-proposal
```

Approve proposal from both signers.

```
$ yarn approve-proposal
```
