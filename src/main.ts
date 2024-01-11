#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getProjectCompiledSources, Config } from './utils';
import { processSources } from './processor';

(async () => {
    const config: Config = getArguments();
    
    const sourceUnits = await getProjectCompiledSources(config.root, config.contracts, config.ignore);
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
                description: 'When set to true, all interface methods must have natspec',
                default: true,
            },
            constructorNatspec: {
                type: 'boolean',
                description: 'True if constructor natspec is mandatory',
                default: false,
            },
            ignore: {
                describe: 'List of directories to exclude from processing',
                default: [],
                type: 'array',
                string: true,
            },
        })
        .parseSync();
}
