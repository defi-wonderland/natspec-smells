import fs from 'fs';
import { Parser } from './parser';
import { Config } from './types/config.t';
import { Validator } from './validator';
import { SourceUnit, FunctionDefinition, ContractDefinition } from 'solc-typed-ast';
import { NodeToProcess } from './types/solc-typed-ast.t';

interface IWarning {
  location: string;
  messages: string[];
}

export class Processor {
  config: Config;
  validator: Validator;
  parser: Parser;

  constructor(config: Config) {
    this.config = config;
    this.validator = new Validator(config);
    this.parser = new Parser();
  }

  processSources(sourceUnits: SourceUnit[]): IWarning[] {
    return sourceUnits.flatMap((sourceUnit) =>
      sourceUnit.vContracts.flatMap((contract) =>
        this.selectEligibleNodes(contract).flatMap((node) => this.validateNodeNatspec(sourceUnit, node, contract))
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
    const nodeNatspec = this.parser.parseNodeNatspec(node);
    return this.validator.validate(node, nodeNatspec);
  }

  validateNodeNatspec(sourceUnit: SourceUnit, node: NodeToProcess, contract: ContractDefinition): IWarning[] {
    if (!node) return [];

    const validationMessages: string[] = this.validateNatspec(node);

    if (validationMessages.length) {
      return [{ location: this.formatLocation(node, sourceUnit, contract), messages: validationMessages }];
    } else {
      return [];
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
