#!/usr/bin/env node
import { compileSol } from 'solc-typed-ast';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { SolcContractNode } from './types/solc-typed-ast.t';
import { parseNodeNatspec } from './parser';
import { validate } from './validator';
import { getRemappings, getSolidityFiles } from './utils';

// TODO: better check all the options here
const ignoredNodeTypes = ['UsingForDirective'];

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
    
    for (const [fileName, source] of Object.entries(compiledFiles.data.sources)) {
        if (fileName.startsWith('node_modules') || fileName.startsWith('lib')) continue;
        
        const fileContracts = (source as any).ast.nodes.filter((node: any) => node.nodeType === 'ContractDefinition');
        fileContracts.forEach((contract: any) => {
            const nodes = contract.nodes as SolcContractNode[];
    
            nodes
            .filter(node => !ignoredNodeTypes.includes(node.nodeType))
            .forEach(node => {
                const nodeNatspec = parseNodeNatspec(node);
                const warnings = validate(node, nodeNatspec);
                const nodeName = node.name || node.kind;
    
                // print warnings
                if (warnings.length) {
                    console.warn(`Natspec warnings in ${fileName}:${contract.name}:${nodeName}`);
                    warnings.forEach(warning => {
                        console.warn('  ' + warning);
                    });
                }
            });
        });

    }
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
