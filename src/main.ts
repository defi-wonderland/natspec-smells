#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getProjectCompiledSources, Config } from './utils';
import { processSources } from './processor';

(async () => {
    const config: Config = getArguments();
    
    const sourceUnits = await getProjectCompiledSources(config.base, config.contracts);
    if (!sourceUnits.length) return console.error('No solidity files found in the specified directory');

    const warnings = await processSources(sourceUnits, config);

    warnings.forEach(({ location, messages }) => {
        console.warn(location);
        messages.forEach(message => {
            console.warn(`  ${message}`);
        });
        console.warn();
    });
})().catch(console.error);

function getArguments(): Config {
    return yargs(hideBin(process.argv))
        .options({
            base: {
                type: 'string',
                description: 'Directory of your root',
                default: './',
            },
            contracts: {
                type: 'string',
                description: 'Directory of your solidity contracts',
                required: true,
            },
            enforceInheritdoc: {
                type: 'boolean',
                description: 'True if natspec is written in interfaces',
                default: true,
            },
            constructorNatspec: {
                type: 'boolean',
                description: 'True if constructor natspec should be checked',
                default: true,
            },
            ignore: {
                describe: 'Ignore directories',
                default: [],
                type: 'array',
                string: true,
            },
        })
        .parseSync();
}
