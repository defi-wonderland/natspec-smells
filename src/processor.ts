import { FunctionDefinition, SourceUnit } from "solc-typed-ast";
import { parseNodeNatspec } from "./parser";
import { validate } from "./validator";

interface IWarning {
    location: string;
    messages: string[];
}

export async function processSources(sourceUnits: SourceUnit[]): Promise<IWarning[]> {
    let warnings: IWarning[] = [];

    sourceUnits.forEach(sourceUnit => {
        sourceUnit.vContracts.forEach(contract => {
            [
                contract.vConstructor,
                ...contract.vEnums,
                ...contract.vErrors,
                ...contract.vEvents,
                ...contract.vFunctions,
                ...contract.vModifiers,
                ...contract.vStateVariables,
                ...contract.vStructs,
                ...contract.vUsedErrors, // TODO: check if this should be processed
                ...contract.vUsedEvents, // TODO: check if this should be processed
            ]
            .forEach(node => {
                if (!node) return;

                const nodeNatspec = parseNodeNatspec(node);
                const validationMessages = validate(node, nodeNatspec);

                // the constructor function definition does not have a name, but it has kind: 'constructor'
                const nodeName = node instanceof FunctionDefinition ? node.name || node.kind : node.name;
    
                if (validationMessages.length) {
                    warnings.push({
                        location: `${sourceUnit.absolutePath}:${contract.name}:${nodeName}`,
                        messages: validationMessages,
                    });
                }
            });
        });
    });

    return warnings;
}