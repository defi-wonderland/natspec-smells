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

    if(node instanceof EnumDefinition) {
        // TODO: Process enums
    } else if(node instanceof ErrorDefinition) {
        alerts = [...alerts, ...validateParameters(node, natspec)];
    } else if(node instanceof EventDefinition) {
        alerts = [...alerts, ...validateParameters(node, natspec)];
    } else if(node instanceof FunctionDefinition) {
        alerts = [...alerts, ...validateParameters(node, natspec)];

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
    } else if(node instanceof ModifierDefinition) {
        alerts = [...alerts, ...validateParameters(node, natspec)];
    } else if(node instanceof StructDefinition) {
        let members = node.vMembers.map(p => p.name);
        let natspecMembers = natspec.params.map(p => p.name);
    
        for(let memberName of members) {
            if(!natspecMembers.includes(memberName)) {
                alerts.push(`@param ${memberName} is missing`);
            }
        }
    } else if(node instanceof VariableDeclaration) {
        // Only the presence of a notice is validated
    }

    return alerts;
}

function validateParameters(node: ErrorDefinition | FunctionDefinition | ModifierDefinition, natspec: Natspec): string[] {
    // Make sure all defined parameters have natspec
    let alerts: string[] = [];

    let definedParameters = node.vParameters.vParameters.map(p => p.name);
    let natspecParameters = natspec.params.map(p => p.name);

    for(let paramName of definedParameters) {
        if(!natspecParameters.includes(paramName)) {
            alerts.push(`@param ${paramName} is missing`);
        }
    }

    return alerts;
}
