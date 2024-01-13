import { Config, Natspec, NodeToProcess } from './types';
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

    const natspecParams = natspec.params.map((p) => p.name);

    // Validate natspec for the constructor only if configured
    if (node instanceof FunctionDefinition && node.kind === 'constructor') {
      return this.config.constructorNatspec ? this.validateParameters(node, natspecParams) : [];
    }

    // Inheritdoc is not enforced nor present, and there is no other documentation, returning error
    if (!natspec.tags.length) return [`Natspec is missing`];

    // Validate the completeness of the documentation
    let alerts: string[] = [];

    if (node instanceof EnumDefinition) {
      // TODO: Process enums
    } else if (node instanceof ErrorDefinition) {
      alerts = [...alerts, ...this.validateParameters(node, natspecParams)];
    } else if (node instanceof EventDefinition) {
      alerts = [...alerts, ...this.validateParameters(node, natspecParams)];
    } else if (node instanceof FunctionDefinition) {
      const natspecReturns = natspec.returns.map((p) => p.name);
      alerts = [...alerts, ...this.validateParameters(node, natspecParams), ...this.validateReturnParameters(node, natspecReturns)];
    } else if (node instanceof ModifierDefinition) {
      alerts = [...alerts, ...this.validateParameters(node, natspecParams)];
    } else if (node instanceof StructDefinition) {
      alerts = [...alerts, ...this.validateMembers(node, natspecParams)];
    } else if (node instanceof VariableDeclaration) {
      // Only the presence of a notice is validated
    }

    return alerts;
  }

  // All defined parameters should have natspec
  private validateParameters(node: ErrorDefinition | FunctionDefinition | ModifierDefinition, natspecParams: (string | undefined)[]): string[] {
    let definedParameters = node.vParameters.vParameters.map((p) => p.name);
    return definedParameters.filter((p) => !natspecParams.includes(p)).map((p) => `@param ${p} is missing`);
  }

  // All members of a struct should have natspec
  private validateMembers(node: StructDefinition, natspecParams: (string | undefined)[]): string[] {
    let members = node.vMembers.map((p) => p.name);
    return members.filter((m) => !natspecParams.includes(m)).map((m) => `@param ${m} is missing`);
  }

  // All returned parameters should have natspec
  private validateReturnParameters(node: FunctionDefinition, natspecReturns: (string | undefined)[]): string[] {
    let alerts: string[] = [];
    let functionReturns = node.vReturnParameters.vParameters.map((p) => p.name);

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

  private requiresInheritdoc(node: NodeToProcess): boolean {
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
