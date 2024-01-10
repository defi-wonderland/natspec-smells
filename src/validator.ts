import { Natspec } from '../src/types/natspec.t';
import { NodeToProcess } from './types/solc-typed-ast.t';
import { EnumDefinition, ErrorDefinition, EventDefinition, FunctionDefinition, ModifierDefinition, StructDefinition, VariableDeclaration } from "solc-typed-ast";

export function validate(node: NodeToProcess, natspec: Natspec): string[] {
    let alerts: string[] = [];

    if (natspec.inheritdoc) {
        return alerts;
    }

    if(!natspec.tags.length) {
        alerts.push(`Natspec is missing`);
        return alerts;
    };

    if(node instanceof FunctionDefinition) {
        let functionParameters = node.vParameters.vParameters.map(p => p.name);
        let natspecParameters = natspec.params.map(p => p.name);
    
        // Make sure all defined function parameters have natspec
        for(let paramName of functionParameters) {
            if(!natspecParameters.includes(paramName)) {
                alerts.push(`@param ${paramName} is missing`);
            }
        }
    
        let functionReturns = node.vReturnParameters.vParameters.map(p => p.name);
        let natspecReturns = natspec.returns.map(p => p.name);
    
        // Make sure all defined returns have natspec
        for(let paramName of functionReturns) {
            if(!natspecReturns.includes(paramName)) {
                let message = paramName === '' ? '@return missing for unnamed return' : `@return ${paramName} is missing`;
                alerts.push(message);
            }
        }
    
        // Make sure there is no natspec defined for non-existing returns
        for(let paramName of natspecReturns) {
            if(paramName && !functionReturns.includes(paramName)) {
                alerts.push(`Missing named return for: @return ${paramName}`);
            }
        }
    } else if(node instanceof EnumDefinition) {
        // TODO: Process EnumDefinition
    } else if(node instanceof ErrorDefinition) {
        // TODO: Process ErrorDefinition
    } else if(node instanceof EventDefinition) {
        // TODO: Process EventDefinition
    } else if(node instanceof FunctionDefinition) {
        // TODO: Process FunctionDefinition
    } else if(node instanceof ModifierDefinition) {
        // TODO: Process ModifierDefinition
    } else if(node instanceof StructDefinition) {
        // TODO: Process StructDefinition
    } else if(node instanceof VariableDeclaration) {
        // TODO: Process VariableDeclaration
    }

    return alerts;
}
