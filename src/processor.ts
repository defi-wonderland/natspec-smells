import { parseNodeNatspec } from "./parser";
import { SolcContractNode } from "./types/solc-typed-ast.t";
import { validate } from "./validator";

interface IWarning {
    location: string;
    messages: string[];
}

// TODO: better check all the options here
const ignoredNodeTypes = ['UsingForDirective'];

export async function processSources(sources: any): Promise<IWarning[]> {
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
    
                if (validationMessages.length) {
                    warnings.push({
                        location: `${fileName}:${contract.name}:${nodeName}`,
                        messages: validationMessages,
                    });
                }
            });
        });
    }

    return warnings;
}