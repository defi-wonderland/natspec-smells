import { Natspec } from '../src/types/natspec.t';
import { NodeToProcess } from './types/solc-typed-ast.t';

export function validate(contractNode: NodeToProcess, natspec: Natspec): string[] {
    let alerts: string[] = [];

    if (natspec.inheritdoc) {
        return alerts;
    }

    if(!natspec.tags.length) {
        alerts.push(`Natspec is missing`);
        return alerts;
    };

    let functionParameters = contractNode.parameters?.parameters.map(p => p.name) ?? [];
    let natspecParameters = natspec.params.map(p => p.name);
    
    // Make sure all defined function parameters have natspec
    for(let paramName of functionParameters) {
        if(!natspecParameters.includes(paramName)) {
            alerts.push(`@param ${paramName} is missing`);
        }
    }

    let functionReturns = contractNode.returnParameters?.parameters.map(p => p.name) ?? [];
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

    return alerts;
};
