import { Natspec } from '../src/types/natspec.t';
import { SolcContractNode } from "./types/solc-typed-ast.t";

interface IAlert {
    severity: string;
    message: string;
}

export function validate(contractNode: SolcContractNode, natspec: Natspec): IAlert[] {
    let alerts: IAlert[] = [];

    if(natspec.tags.length === 0) {
        alerts.push({
            severity: 'error',
            message: `Natspec is missing`,
        });
    };

    // Make sure all defined function parameters have natspec
    let functionParameters = contractNode.parameters?.parameters.map(p => p.name) ?? [];
    let natspecParameters = natspec.params.map(p => p.name);

    for(let param of functionParameters) {
        if(!natspecParameters.includes(param)) {
            alerts.push({
                severity: 'error',
                message: `Natspec for ${param} is missing`,
            });
        }
    }

    // Make sure there is no natspec defined for non-existing parameters
    for(let param of natspecParameters) {
        if(!functionParameters.includes(param)) {
            alerts.push({
                severity: 'error',
                message: `Found natspec for undefined function parameter ${param}`,
            });
        }
    }

    let functionReturns = contractNode.returnParameters?.parameters.map(p => p.name) ?? [];
    let natspecReturns = natspec.returns.map(p => p.name);

    for(let param of functionReturns) {
        if(!natspecReturns.includes(param)) {
            let message = param === '' ? 'Natspec for a return parameter is missing' : `Natspec for ${param} is missing`;
            alerts.push({
                severity: 'error',
                message: message,
            });
        }
    }

    // Make sure there is no natspec defined for non-existing returns
    for(let param of natspecReturns) {
        if(param && !functionReturns.includes(param)) {
            alerts.push({
                severity: 'error',
                message: `Found natspec for undefined returned value ${param}`,
            });
        }
    }

    return alerts;
};
