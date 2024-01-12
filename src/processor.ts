import fs from 'fs';
import { InternalConfig } from './types/config';
import { Validator } from './validator';
import { SourceUnit, FunctionDefinition, ContractDefinition } from 'solc-typed-ast';
import { NodeToProcess } from './types/solc-typed-ast.d';
import { parseNodeNatspec } from './utils';

interface IWarning {
  location: string;
  messages: string[];
}

export class Processor {
  config: InternalConfig;
  validator: Validator;

  constructor(config: InternalConfig) {
    this.config = config;
    this.validator = new Validator(config);
  }

  processSources(sourceUnits: SourceUnit[]): IWarning[] {
    return sourceUnits.flatMap((sourceUnit) =>
      sourceUnit.vContracts.flatMap((contract) =>
        this.selectEligibleNodes(contract)
          .map((node) => this.validateNodeNatspec(sourceUnit, node, contract))
          .filter((warning) => warning.messages.length)
      )
    );
  }

  selectEligibleNodes(contract: ContractDefinition): NodeToProcess[] {
    return [
      ...contract.vEnums,
      ...contract.vErrors,
      ...contract.vEvents,
      ...contract.vFunctions,
      ...contract.vModifiers,
      ...contract.vStateVariables,
      ...contract.vStructs,
    ];
  }

  validateNatspec(node: NodeToProcess): string[] {
    if (!node) return [];
    const nodeNatspec = parseNodeNatspec(node);
    return this.validator.validate(node, nodeNatspec);
  }

  validateNodeNatspec(sourceUnit: SourceUnit, node: NodeToProcess, contract: ContractDefinition): IWarning {
    const validationMessages: string[] = this.validateNatspec(node);

    if (validationMessages.length) {
      return { location: this.formatLocation(node, sourceUnit, contract), messages: validationMessages };
    } else {
      return { location: '', messages: [] };
    }
  }

  formatLocation(node: NodeToProcess, sourceUnit: SourceUnit, contract: ContractDefinition): string {
    // the constructor function definition does not have a name, but it has kind: 'constructor'
    const nodeName = node instanceof FunctionDefinition ? node.name || node.kind : node.name;
    const line = this.getLineNumberFromSrc(sourceUnit.absolutePath, node.src);
    return `${sourceUnit.absolutePath}:${line}\n${contract.name}:${nodeName}`;
  }

  private getLineNumberFromSrc(filePath: string, src: string) {
    const [start] = src.split(':').map(Number);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.substring(0, start).split('\n');
    return lines.length; // Line number
  }
}
