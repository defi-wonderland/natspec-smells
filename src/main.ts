#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Config } from './types/config.t';
import { getProjectCompiledSources } from './utils';
import { globSync } from 'fast-glob';
import { Processor } from './processor';

(async () => {
  const config: Config = getArguments();
  const ignoredPaths = config.ignore.map((path: string) => globSync(path, { cwd: config.root })).flat();
  const sourceUnits = await getProjectCompiledSources(config.root, config.contracts, ignoredPaths);
  if (!sourceUnits.length) return console.error('No solidity files found in the specified directory');

  const processor = new Processor(config);
  const warnings = processor.processSources(sourceUnits);

  warnings.forEach(({ location, messages }) => {
    console.warn(location);
    messages.forEach((message) => {
      console.warn(`  ${message}`);
    });
    console.warn();
  });
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
