import { Natspec } from '../src/types/natspec.t';
import { SolcContractNode } from "./types/solc-typed-ast.t";

interface IAlert {
    severity: string;
    message: string;
}

// export interface SolcContractNode {
//     body?: Block;
//     constant?: boolean;
//     documentation: Documentation;
//     functionSelector?: string;
//     id: number;
//     implemented?: boolean;
//     kind?: string;
//     modifiers?: any[];
//     name: string;
//     nameLocation: string;
//     nodeType: string;
//     parameters?: ParameterList;
//     returnParameters?: ParameterList;
//     scope: number;
//     src: string;
//     stateMutability?: string;
//     virtual?: boolean;
//     visibility: string;
//     mutability?: string;
//     stateVariable?: boolean;
//     storageLocation?: string;
//     typeDescriptions?: TypeDescriptions;
//     typeName?: TypeName;
//     value?: Literal;
// }

export function validate(contractNode: SolcContractNode, natspec: Natspec): IAlert[] {
    let alerts: IAlert[] = [];

    // if(natspec.tags.length === 0) {
    //     alerts.push({
    //         severity: 'error',
    //         message: `Natspec is missing`,
    //     });
    // };

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

    // for (const param of parsedParams) {
    //     if (!natspecParams.has(param)) {
    //         alerts.push({
    //             severity: 'error',
    //             message: `Natspec for ${param} is missing`,
    //         });
    //     }
    // }

    // // Validate return values
    // const parsedReturns = new Set(contractNode.returns.map(r => r.name));
    // const natspecReturns = new Set(natspec.returns.map(r => r.name));

    // for (const ret of natspecReturns) {
    //     if (!parsedReturns.has(ret)) {
    //         alerts.push({
    //             severity: 'error',
    //             message: `Found natspec for undefined returned value ${ret}`,
    //         });
    //     }
    // }

    // for (const ret of parsedReturns) {
    //     if (!natspecReturns.has(ret)) {
    //         alerts.push({
    //             severity: 'error',
    //             message: `Natspec for ${ret} is missing`,
    //         });
    //     }
    // }

    return alerts;
};
