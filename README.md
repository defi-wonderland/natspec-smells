[![Version](https://img.shields.io/npm/v/@defi-wonderland/natspec-smells?label=Version)](https://www.npmjs.com/package/@defi-wonderland/natspec-smells)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/defi-wonderland/natspec-smells/blob/main/LICENSE)

# Natspec Smells

Just like code, documentation can smell, too. `natspec-smells` aims to help automatically identify missing or incomplete natspec.

## Usage

1. Install the package:

   ```bash
   yarn add --dev @defi-wonderland/natspec-smells
   ```

2. Create a config file named `natspec-smells.config.js`, you can use the following as an example:

   ```javascript
   /**
    * For full explanation of each supported config, make sure to check the Config type below
    */

   /** @type {import('@defi-wonderland/natspec-smells').Config} */
   module.exports = {
     include: "src",
     exclude: ["tests", "scripts"],
   };
   ```

3. Run
   ```bash
   yarn @defi-wonderland/natspec-smells
   ```

## Verify your natspec in CI

_Soon to come._

## Options

| Option               | Description                                                        | Required | Default |
| -------------------- | ------------------------------------------------------------------ | -------- | ------- |
| `include`            | Glob pattern of files to process.                                  | Yes      |         |
| `exclude`            | Glob patterns of files to exclude.                                 | No       | `[]`    |
| `root`               | Project root directory.                                            | No       | `./`    |
| `enforceInheritdoc`  | True if all external and public functions should have @inheritdoc. | No       | `true`  |
| `constructorNatspec` | True if the constructor should have natspec.                       | No       | `false` |

## Contributors

Keep3r Framework was built with ❤️ by [Wonderland](https://defi.sucks).

Wonderland the largest core development group in web3. Our commitment is to a financial future that's open, decentralized, and accessible to all.

[DeFi sucks](https://defi.sucks), but Wonderland is here to make it better.
