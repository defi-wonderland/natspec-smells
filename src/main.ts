#!/usr/bin/env node
import path from 'path';
import { glob } from 'fast-glob';
import { getProjectCompiledSources } from './utils';
import { Processor } from './processor';
import { Config } from './types';
import { Validator } from './validator';
import { getConfig } from './config';

/**
 * Main function that processes the sources and prints the warnings
 */
(async () => {
  // Requires the config is in the root of the users directory
  const configPath = path.join(process.cwd(), './natspec-smells.config.json');
  const config: Config = getConfig(configPath);

  // TODO: Add configuration logic to the linter
  const excludedPaths = config.exclude === '' ? [] : await glob(config.exclude, { cwd: config.root });
  const includedPaths = await glob(config.include, { cwd: config.root, ignore: excludedPaths });

  const sourceUnits = await getProjectCompiledSources(config.root, includedPaths);
  if (!sourceUnits.length) return console.error('No solidity files found in the specified directory');

  const validator = new Validator(config);
  const processor = new Processor(validator);
  const warnings = await processor.processSources(sourceUnits);

  if (!warnings.length) {
    console.warn('No issues found');
    return;
  }

  warnings.forEach(({ location, messages }) => {
    console.warn(location);
    messages.forEach((message) => {
      console.warn(`  ${message}`);
    });
    console.warn();
  });
})().catch(console.error);
