import { Natspec } from '../src/types/natspec.t';
import { Config } from './utils';
import { NodeToProcess } from './types/solc-typed-ast.t';
import {
  EnumDefinition,
  ErrorDefinition,
  EventDefinition,
  FunctionDefinition,
  ModifierDefinition,
  StructDefinition,
  VariableDeclaration,
} from 'solc-typed-ast';

export class Validator {
  config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  validate(node: NodeToProcess, natspec: Natspec): string[] {
    // There is inheritdoc, no other validation is needed
    if (natspec.inheritdoc) return [];

    // Inheritdoc is enforced but not present, returning an error
    if (this.config.enforceInheritdoc && this.requiresInheritdoc(node)) return [`@inheritdoc is missing`];

    // Validate natspec for the constructor only if configured
    if (node instanceof FunctionDefinition && node.kind === 'constructor') {
      return this.config.constructorNatspec ? this.validateParameters(node, natspec) : [];
    }

    // Inheritdoc is not enforced nor present, and there is no other documentation, returning error
    if (!natspec.tags.length) return [`Natspec is missing`];

    // Validate the completeness of the documentation
    let alerts: string[] = [];
    if (node instanceof EnumDefinition) {
      // TODO: Process enums
    } else if (node instanceof ErrorDefinition) {
      alerts = [...alerts, ...this.validateParameters(node, natspec)];
    } else if (node instanceof EventDefinition) {
      alerts = [...alerts, ...this.validateParameters(node, natspec)];
    } else if (node instanceof FunctionDefinition) {
      alerts = [...alerts, ...this.validateParameters(node, natspec), ...this.validateReturnParameters(node, natspec)];
    } else if (node instanceof ModifierDefinition) {
      alerts = [...alerts, ...this.validateParameters(node, natspec)];
    } else if (node instanceof StructDefinition) {
      alerts = [...alerts, ...this.validateMembers(node, natspec)];
    } else if (node instanceof VariableDeclaration) {
      // Only the presence of a notice is validated
    }

    return alerts;
  }

  validateParameters(node: ErrorDefinition | FunctionDefinition | ModifierDefinition, natspec: Natspec): string[] {
    // Make sure all defined parameters have natspec
    let alerts: string[] = [];

    let definedParameters = node.vParameters.vParameters.map((p) => p.name);
    let natspecParameters = natspec.params.map((p) => p.name);

    for (let paramName of definedParameters) {
      if (!natspecParameters.includes(paramName)) {
        alerts.push(`@param ${paramName} is missing`);
      }
    }

    return alerts;
  }

  validateReturnParameters(node: FunctionDefinition, natspec: Natspec): string[] {
    let alerts: string[] = [];
    let functionReturns = node.vReturnParameters.vParameters.map((p) => p.name);
    let natspecReturns = natspec.returns.map((p) => p.name);

    // Make sure all defined returns have natspec
    for (let paramName of functionReturns) {
      if (!natspecReturns.includes(paramName)) {
        let message = paramName === '' ? '@return missing for unnamed return' : `@return ${paramName} is missing`;
        alerts.push(message);
      }
    }

    // Make sure there is no natspec defined for non-existing returns
    for (let paramName of natspecReturns) {
      if (paramName && !functionReturns.includes(paramName)) {
        alerts.push(`Missing named return for: @return ${paramName}`);
      }
    }

    return alerts;
  }

  validateMembers(node: StructDefinition, natspec: Natspec): string[] {
    let alerts: string[] = [];
    let members = node.vMembers.map((p) => p.name);
    let natspecMembers = natspec.params.map((p) => p.name);

    for (let memberName of members) {
      if (!natspecMembers.includes(memberName)) {
        alerts.push(`@param ${memberName} is missing`);
      }
    }

    return alerts;
  }

  requiresInheritdoc(node: NodeToProcess): boolean {
    let _requiresInheritdoc: boolean = false;

    // External or public function
    _requiresInheritdoc ||= node instanceof FunctionDefinition && (node.visibility === 'external' || node.visibility === 'public');

    // Internal virtual function
    _requiresInheritdoc ||= node instanceof FunctionDefinition && node.visibility === 'internal' && node.virtual;

    // Public variable
    _requiresInheritdoc ||= node instanceof VariableDeclaration && node.visibility === 'public';

    return _requiresInheritdoc;
  }
}
