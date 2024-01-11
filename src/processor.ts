// import fs from 'fs';
import { Parser } from './parser';
import { Config } from './utils';
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
    // TODO: Fix the line number calculation
    // const sourceCode = fs.readFileSync(sourceUnit.absolutePath, 'utf8');
    // const line = this.lineNumber(nodeName as string, sourceCode);

    return `${sourceUnit.absolutePath}\n${contract.name}:${nodeName}`;
  }

  lineNumberByIndex(index: number, string: string): Number {
    let line = 0;
    let match;
    let re = /(^)[\S\s]/gm;

    while ((match = re.exec(string))) {
      if (match.index > index) break;
      line++;
    }
    return line;
  }

  lineNumber(needle: string, haystack: string): Number {
    return this.lineNumberByIndex(haystack.indexOf(needle), haystack);
  }
}
