#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { globSync } from 'fast-glob';
import { getProjectCompiledSources } from './utils';
import { processSources } from './processor';
import { getConfig } from './config';

(async () => {
  const { config: configPath } = getArguments();
  const config = await getConfig(configPath);

  const ignoredPaths = config.ignore.map((path) => globSync(path, { cwd: config.root })).flat();
  const sourceUnits = await getProjectCompiledSources(config.root, config.contracts, ignoredPaths);
  if (!sourceUnits.length) return console.error('No solidity files found in the specified directory');

  const warnings = await processSources(sourceUnits, config);

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
      config: {
        type: 'string',
        description: 'Path to your config file',
        default: './natspec-smells.config.js',
      },
    })
    .parseSync();
}