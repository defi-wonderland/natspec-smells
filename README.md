[![Version](https://img.shields.io/npm/v/@defi-wonderland/natspec-smells?label=Version)](https://www.npmjs.com/package/@defi-wonderland/natspec-smells)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/defi-wonderland/natspec-smells/blob/main/LICENSE)

# Natspec Smells

Just like code, documentation can smell, too. `natspec-smells` aims to help automatically identify missing or incomplete natspec.

## Usage

As simple as it gets, run:

```bash
npx @defi-wonderland/natspec-smells --contracts ./solidity
```

## Options

### `--contracts` (Required)

Relative path to your solidity files.

### `--root`

Root directory to be used.

Default: `./`

### `--enforceInheritdoc`

Whether `@inheritdoc` is used or not.

Default: `true`

### `--constructorNatspec`

Whether to enforce natspec for constructors.

Default: `false`

### `--ignore`

Glob pattern of files and directories to exclude from processing.

Default: `[]`

## Contributors

Natspec Smells was built with ❤️ by [Wonderland](https://defi.sucks).

Wonderland is a team of top Web3 researchers, developers, and operators who believe that the future needs to be open-source, permissionless, and decentralized.

[DeFi sucks](https://defi.sucks), but Wonderland is here to make it better.
