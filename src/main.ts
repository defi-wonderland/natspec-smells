#!/usr/bin/env node
import { compileSol } from 'solc-typed-ast';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { SolcContractNode } from './types/solc-typed-ast.t';
import { parseNodeNatspec } from './parser';
import { validate } from './validator';
import { getRemappings, getSolidityFiles } from './utils';

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
        const nodes = (source as any).ast.nodes.slice(-1)[0].nodes as SolcContractNode[];
        if (fileName.startsWith('node_modules') || fileName.startsWith('lib')) continue;

        nodes.forEach(node => {
            const nodeNatspec = parseNodeNatspec(node);
            const alerts = validate(node, nodeNatspec);

            // print alerts
            if (alerts.length) {
                console.warn(`Natspec alerts in ${fileName}:${node.name}`);
                alerts.forEach(alert => {
                    console.warn('  ' + alert.message);
                });
            }
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
