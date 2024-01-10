#!/usr/bin/env node
import { ASTKind, ASTReader, compileSol } from 'solc-typed-ast';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getProjectCompiledSources, getRemappings, getSolidityFiles } from './utils';
import { processSources } from './processor';

(async () => {
    const { base, contracts } = getArguments();
    
    const sourceUnits = await getProjectCompiledSources(base, contracts);
    if (!sourceUnits.length) return console.error('No solidity files found in the specified directory');

    const warnings = await processSources(sourceUnits);

    warnings.forEach(({ location, messages }) => {
        console.warn(location);
        messages.forEach(message => {
            console.warn(`  ${message}`);
        });
        console.warn();
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