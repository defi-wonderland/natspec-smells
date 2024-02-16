import { Config, Natspec, NodeToProcess } from './types';
import { matchesFunctionKind, getElementFrequency } from './utils';
import {
  EnumDefinition,
  ErrorDefinition,
  EventDefinition,
  FunctionDefinition,
  ModifierDefinition,
  StructDefinition,
  VariableDeclaration,
  ContractDefinition,
} from 'solc-typed-ast';

/**
 * Validator class that validates the natspec of the nodes
 */
export class Validator {
  config: Config;

  /**
   * @param {Config} config - The configuration object
   */
  constructor(config: Config) {
    this.config = config;
  }

  /**
   * Validates the natspec of the node
   * @param {NodeToProcess} node - The node to validate (Enum, Function etc.)
   * @param {Natspec} natspec - Parsed natspec of the node
   * @returns {string[]} - The list of alerts
   */
  validate(node: NodeToProcess, natspec: Natspec): string[] {
    // Ignore fallback and receive
    if (matchesFunctionKind(node, 'receive') || matchesFunctionKind(node, 'fallback')) {
      return [];
    }

    // There is inheritdoc, no other validation is needed
    if (natspec.inheritdoc) return [];

    // Inheritdoc is enforced but not present, returning an error
    if (this.config.enforceInheritdoc && this.requiresInheritdoc(node)) return [`@inheritdoc is missing`];

    const natspecParams = natspec.params.map((p) => p.name);

    // Validate natspec for the constructor only if configured
    if (matchesFunctionKind(node, 'constructor')) {
      return this.config.constructorNatspec ? this.validateParameters(node as FunctionDefinition, natspecParams) : [];
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

  /**
   * Validates the natspec for parameters.
   * All defined parameters should have natspec.
   * @param {ErrorDefinition | FunctionDefinition | ModifierDefinition} node - The node to validate
   * @param {string[]} natspecParams - The list of parameters from the natspec
   * @returns {string[]} - The list of alerts
   */
  private validateParameters(node: ErrorDefinition | FunctionDefinition | ModifierDefinition, natspecParams: (string | undefined)[]): string[] {
    let definedParameters = node.vParameters.vParameters.map((p) => p.name);
    let alerts: string[] = [];
    const counter = getElementFrequency(natspecParams);

    for (let paramName of definedParameters) {
      if (!natspecParams.includes(paramName)) {
        alerts.push(`@param ${paramName} is missing`);
      } else if (counter[paramName] > 1) {
        alerts.push(`@param ${paramName} is duplicated`);
      }
    }
    return alerts;
  }

  /**
   * Validates the natspec for members of a struct.
   * All members of a struct should have natspec.
   * @param {StructDefinition} node - The struct node
   * @param {string[]} natspecParams - The list of parameters from the natspec
   * @returns {string[]} - The list of alerts
   */
  private validateMembers(node: StructDefinition, natspecParams: (string | undefined)[]): string[] {
    let members = node.vMembers.map((p) => p.name);
    let alerts: string[] = [];
    const counter = getElementFrequency(natspecParams);

    for (let memberName of members) {
      if (!natspecParams.includes(memberName)) {
        alerts.push(`@param ${memberName} is missing`);
      } else if (counter[memberName] > 1) {
        alerts.push(`@param ${memberName} is duplicated`);
      }
    }

    return alerts;
  }

  /**
   * Validates the natspec for return parameters.
   * All returned parameters should have natspec
   * @param {FunctionDefinition} node
   * @param {(string | undefined)[]} natspecReturns
   * @returns {string[]} - The list of alerts
   */
  private validateReturnParameters(node: FunctionDefinition, natspecReturns: (string | undefined)[]): string[] {
    let alerts: string[] = [];
    let functionReturns = node.vReturnParameters.vParameters.map((p) => p.name);

    // Make sure all defined returns have natspec
    for (let [paramIndex, paramName] of functionReturns.entries()) {
      if (paramIndex > natspecReturns.length - 1) {
        let message = paramName === '' ? `@return missing for unnamed return №${paramIndex + 1}` : `@return ${paramName} is missing`;
        alerts.push(message);
      } else if (natspecReturns[paramIndex] !== paramName && paramName !== '') {
        let message = `@return ${paramName} is missing`;
        alerts.push(message);
      }
    }

    return alerts;
  }

  /**
   * Checks if the node requires inheritdoc
   * @param {NodeToProcess} node - The node to process
   * @returns {boolean} - True if the node requires inheritdoc
   */
  private requiresInheritdoc(node: NodeToProcess): boolean {
    let _requiresInheritdoc: boolean = false;

    // External or public function
    _requiresInheritdoc ||=
      node instanceof FunctionDefinition && (node.visibility === 'external' || node.visibility === 'public') && !node.isConstructor;

    // Overridden internal functions
    _requiresInheritdoc ||= node instanceof FunctionDefinition && node.visibility === 'internal' && !!node.vOverrideSpecifier;

    // Public variable
    _requiresInheritdoc ||= node instanceof VariableDeclaration && node.visibility === 'public';

    // The node is in a contract
    _requiresInheritdoc &&= node.parent instanceof ContractDefinition && node.parent.kind === 'contract';

    return _requiresInheritdoc;
  }
}
