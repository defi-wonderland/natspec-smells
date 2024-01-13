import fs from 'fs/promises';
import { Validator } from './validator';
import { SourceUnit, FunctionDefinition, ContractDefinition } from 'solc-typed-ast';
import { NodeToProcess } from './types';
import { getLineNumberFromSrc, parseNodeNatspec } from './utils';

interface IWarning {
  location: string;
  messages: string[];
}

export class Processor {
  constructor(private validator: Validator) {}

  async processSources(sourceUnits: SourceUnit[]): Promise<IWarning[]> {
    const warnings: IWarning[] = [];

    // Iterate over each source file
    for (const sourceUnit of sourceUnits) {
      // Read the file content
      const fileContent = await fs.readFile(sourceUnit.absolutePath, 'utf8');

      // Iterate over each contract in the source file
      for (const contract of sourceUnit.vContracts) {
        // Iterate over each node of the contract
        const nodes = this.selectEligibleNodes(contract);
        for (const node of nodes) {
          // Find warning messages of the natspec of the node
          const messages = this.validateNatspec(node);
          if (messages.length) {
            // Add the warning messages to the list together with the natspec location
            warnings.push({
              location: this.formatLocation(sourceUnit.absolutePath, fileContent, contract, node),
              messages,
            });
          }
        }
      }
    }

    return warnings;
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

  formatLocation(filePath: string, fileContent: string, contract: ContractDefinition, node: NodeToProcess): string {
    // the constructor function definition does not have a name, but it has kind: 'constructor'
    const nodeName = node instanceof FunctionDefinition ? node.name || node.kind : node.name;
    const line: number = getLineNumberFromSrc(fileContent, node.src);
    return `${filePath}:${line}\n${contract.name}:${nodeName}`;
  }
}
