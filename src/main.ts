#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { globSync } from 'fast-glob';
import { getProjectCompiledSources } from './utils';
import { Processor } from './processor';
import { Config } from './types/config';

(async () => {
  const config: Config = getArguments();

  const excludedPaths = config.exclude.map((path) => globSync(path, { cwd: config.root })).flat();
  const sourceUnits = await getProjectCompiledSources(config.root, config.include, excludedPaths);
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

function getArguments() {
  return yargs(hideBin(process.argv))
    .strict()
    .options({
      include: {
        type: 'string',
        description: 'Glob pattern of files to process.',
        required: true,
      },
      exclude: {
        type: 'array',
        description: 'Glob patterns of files to exclude.',
        default: [],
        string: true,
      },
      root: {
        type: 'string',
        description: 'Root directory of the project.',
        default: './',
      },
      enforceInheritdoc: {
        type: 'boolean',
        description: 'If set to true, all external and public functions must have @inheritdoc.',
        default: true,
      },
      constructorNatspec: {
        type: 'boolean',
        description: 'True if constructor natspec is mandatory.',
        default: false,
      },
    })
    .config()
    .alias('include', 'include-path')
    .alias('exclude', 'exclude-path')
    .parseSync();
}
