#!/usr/bin/env node
import { compileSol } from 'solc-typed-ast';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getRemappings, getSolidityFiles, Config } from './utils';
import { processSources } from './processor';

(async () => {
    const config: Config = getArguments();

    // Fetch Solidity files from the specified directory
    const solidityFiles: string[] = await getSolidityFiles(config.contracts);
    if (!solidityFiles.length) return console.error('No solidity files found in the specified directory');

    const remappings: string[] = await getRemappings(config.base);

    const compiledFiles = await compileSol(solidityFiles, 'auto', {
        basePath: config.base,
        remapping: remappings,
        includePath: [config.base],
    });

    const warnings = await processSources(compiledFiles.data.sources, config);

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
