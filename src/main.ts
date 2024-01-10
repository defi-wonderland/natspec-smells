#!/usr/bin/env node
import { compileSol } from 'solc-typed-ast';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getRemappings, getSolidityFiles } from './utils';
import { processSources } from './processor';

(async () => {
    const { base, contracts } = getArguments();

    // Fetch Solidity files from the specified directory
    const solidityFiles: string[] = await getSolidityFiles(contracts);
    if (!solidityFiles.length) return console.error('No solidity files found in the specified directory');

    const remappings: string[] = await getRemappings(base);

    const compiledFiles = await compileSol(solidityFiles, 'auto', {
        basePath: base,
        remapping: remappings,
        includePath: [base],
    });
    
    const warnings = await processSources(compiledFiles.data.sources);

    warnings.forEach(({ location, messages }) => {
        console.warn(location);
        messages.forEach(message => {
            console.warn('  ' + message);
        });
    });
})().catch(console.error);

function getArguments() {
    return yargs(hideBin(process.argv))
        .options({
            'base': {
                type: 'string',
                description: 'Directory of your root',
                default: './',
            },
            'contracts': {
                type: 'string',
                description: 'Directory of your solidity contracts',
                required: true,
            },
        })
        .parseSync();
}