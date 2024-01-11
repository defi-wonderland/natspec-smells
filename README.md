[![Version](https://img.shields.io/npm/v/@defi-wonderland/natspec-smells?label=Version)](https://www.npmjs.com/package/@defi-wonderland/natspec-smells)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/defi-wonderland/natspec-smells/blob/main/LICENSE)

# Natspec Smells

Just like code, documentation can smell, too. `natspec-smells` aims to help automatically identify missing or incomplete natspec.

## Usage

As simple as it gets, run:
```bash
npx @defi-wonderland/natspec-smells --contracts ./solidity
```

Example output:
```text
sample-data/BasicSample.sol:16
BasicSample:constructor
  Natspec is missing

sample-data/BasicSample.sol:21
BasicSample:BasicSample_BasicEvent
  @param _param1 is missing

sample-data/BasicSample.sol:8
BasicSample:TestStruct
  @return someAddress is missing
```

## Options

### `--contracts` (Required)
Relative path to your solidity files.

### `--base`
Base directory to be used.

Default: `./`

## Contributors

Natspec Smells was built with ❤️ by [Wonderland](https://defi.sucks).

Wonderland is a team of top Web3 researchers, developers, and operators who believe that the future needs to be open-source, permissionless, and decentralized.

[DeFi sucks](https://defi.sucks), but Wonderland is here to make it better.
