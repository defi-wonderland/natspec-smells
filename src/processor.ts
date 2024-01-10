import { parseNodeNatspec } from "./parser";
import { SolcContractNode } from "./types/solc-typed-ast.t";
import { Config } from './utils';
import { validate } from "./validator";
import fs from 'fs';

interface IWarning {
    location: string;
    messages: string[];
}

// TODO: better check all the options here
const ignoredNodeTypes = ['UsingForDirective'];

export async function processSources(sources: any, config: Config): Promise<IWarning[]> {
    let warnings: IWarning[] = [];

    for (const [fileName, source] of Object.entries(sources)) {
        if (fileName.startsWith('node_modules') || fileName.startsWith('lib')) continue;

        const fileContracts = (source as any).ast.nodes.filter((node: any) => node.nodeType === 'ContractDefinition');
        fileContracts.forEach((contract: any) => {
            const nodes = contract.nodes as SolcContractNode[];
    
            nodes
            .filter(node => !ignoredNodeTypes.includes(node.nodeType))
            .forEach(node => {
                const nodeNatspec = parseNodeNatspec(node);
                const validationMessages = validate(node, nodeNatspec);
                const nodeName = node.name || node.kind;
                const absolutePath = (source as any).ast.absolutePath;
                const sourceCode = fs.readFileSync(absolutePath, 'utf8');
                const line = lineNumber(nodeName as string, sourceCode);
    
                if (validationMessages.length) {
                    warnings.push({
                        location: `${fileName}:${line}\n${contract.name}:${nodeName}`,
                        messages: validationMessages,
                    });
                }
            });
        });
    }

    return warnings;
}

function lineNumberByIndex(index: number, string: string): Number {
    let line = 0
    let match;
    let re = /(^)[\S\s]/gm;

    while (match = re.exec(string)) {
        if(match.index > index) break;
        line++;
    }
    return line;
}

function lineNumber(needle: string, haystack: string): Number {
    return lineNumberByIndex(haystack.indexOf(needle), haystack);
}
