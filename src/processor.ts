import { parseNodeNatspec } from './parser';
import { Config } from './utils';
import { validate } from './validator';
import { SourceUnit, FunctionDefinition } from 'solc-typed-ast';
import fs from 'fs';

interface IWarning {
  location: string;
  messages: string[];
}

export async function processSources(sourceUnits: SourceUnit[], config: Config): Promise<IWarning[]> {
  let warnings: IWarning[] = [];

  sourceUnits.forEach((sourceUnit) => {
    sourceUnit.vContracts.forEach((contract) => {
      [
        ...contract.vEnums,
        ...contract.vErrors,
        ...contract.vEvents,
        ...contract.vFunctions,
        ...contract.vModifiers,
        ...contract.vStateVariables,
        ...contract.vStructs,
      ].forEach((node) => {
        if (!node) return;

        const nodeNatspec = parseNodeNatspec(node);
        const validationMessages = validate(node, nodeNatspec, config);

        // the constructor function definition does not have a name, but it has kind: 'constructor'
        const nodeName = node instanceof FunctionDefinition ? node.name || node.kind : node.name;
        const sourceCode = fs.readFileSync(sourceUnit.absolutePath, 'utf8');
        const line = lineNumber(nodeName as string, sourceCode);

        if (validationMessages.length) {
          warnings.push({
            location: `${sourceUnit.absolutePath}:${line}\n${contract.name}:${nodeName}`,
            messages: validationMessages,
          });
        }
      });
    });
  });

  return warnings;
}

function lineNumberByIndex(index: number, string: string): Number {
  let line = 0;
  let match;
  let re = /(^)[\S\s]/gm;

  while ((match = re.exec(string))) {
    if (match.index > index) break;
    line++;
  }
  return line;
}

function lineNumber(needle: string, haystack: string): Number {
  return lineNumberByIndex(haystack.indexOf(needle), haystack);
}
