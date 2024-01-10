import { Natspec } from '../src/types/natspec.t';
import { SolcContractNode } from "./types/solc-typed-ast.t";
import { Config } from './utils';

export function validate(contractNode: SolcContractNode, natspec: Natspec, config: Config): string[] {
    let alerts: string[] = [];

    console.log(contractNode);

    if (config.enforceInheritdoc && canHaveInheritdoc(contractNode) && !natspec.inheritdoc) {
        alerts.push(`@inheritdoc is missing`);
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

function canHaveInheritdoc(contractNode: SolcContractNode): boolean {
    let _canHaveInheritdoc: boolean = false;
    
    // External or public function
    _canHaveInheritdoc = contractNode.kind == 'function' && (contractNode.visibility === 'external' || contractNode.visibility === 'public');

    // Internal virtual function
    _canHaveInheritdoc ||= contractNode.kind == 'function' && (contractNode.visibility === 'internal' || !!contractNode.virtual);

    // Public variable
    _canHaveInheritdoc ||= contractNode.kind == 'variable' && contractNode.visibility === 'public';

    return _canHaveInheritdoc;
}
