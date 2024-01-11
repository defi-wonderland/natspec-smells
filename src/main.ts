#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Config } from './types/config.t';
import { Runner } from './runner';

(async () => {
  const config: Config = getArguments();
  const runner: Runner = new Runner(config);
  await runner.run();
})().catch(console.error);

function getArguments(): Config {
  return yargs(hideBin(process.argv))
    .strict()
    .options({
      root: {
        type: 'string',
        description: 'The target root directory',
        default: './',
      },
      contracts: {
        type: 'string',
        description: 'The directory containing your Solidity contracts',
        required: true,
      },
      enforceInheritdoc: {
        type: 'boolean',
        description: 'If set to true, all external and public functions must have @inheritdoc',
        default: true,
      },
      constructorNatspec: {
        type: 'boolean',
        description: 'True if constructor natspec is mandatory',
        default: false,
      },
      ignore: {
        describe: 'Glob pattern of files and directories to exclude from processing',
        default: [],
        type: 'array',
        string: true,
      },
    })
    .parseSync();
}
