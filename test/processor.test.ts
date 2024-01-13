import { Config } from '../src/types/config';
import { ContractDefinition, FunctionDefinition, UserDefinedType, UsingForDirective } from 'solc-typed-ast';
import { getFileCompiledSource } from './utils';
import { Processor } from '../src/processor';
import { Validator } from '../src/validator';

describe('Processor', () => {
  let processor: Processor;

  beforeAll(() => {
    const config: Config = {
      root: '.',
      include: './sample-data',
      exclude: [],
      enforceInheritdoc: false,
      constructorNatspec: false,
    };

    const validator = new Validator(config);
    processor = new Processor(validator);
  });

  // TODO: Fix these tests
  // describe('formatLocation', () => {
  //   const absolutePath = faker.system.filePath();
  //   const contractName = faker.lorem.word();
  //   const nodeName = faker.lorem.word();

  //   const sourceUnit = mockSourceUnit({
  //     absolutePath: absolutePath,
  //   });

  //   const contract = mockContractDefinition({
  //     name: contractName,
  //   });

  //   it('should format the location of the node', () => {
  //     const node = mockNodeToProcess({
  //       name: nodeName,
  //     });

  //     expect(processor.formatLocation(node, sourceUnit, contract)).toEqual(`${absolutePath}\n${contractName}:${nodeName}`);
  //   });

  //   it('should format the location of a constructor', () => {
  //     const node = mockFunctionDefinition({
  //       kind: FunctionKind.Constructor,
  //     });

  //     expect(processor.formatLocation(node, sourceUnit, contract)).toEqual(`${absolutePath}\n${contractName}:constructor`);
  //   });
  // });

  describe('selectEligibleNodes', () => {
    let contract: ContractDefinition;

    beforeAll(async () => {
      const compileResult = await getFileCompiledSource('sample-data/ParserTest.sol');
      contract = compileResult.vContracts.find(({ name }) => name === 'ParserTest')!;
    });

    it('should select enums', () => {
      const eligibleNodes = processor.selectEligibleNodes(contract);

      contract.vEnums.forEach((enumNode) => {
        expect(eligibleNodes.find(({ name }) => name === enumNode.name)).toBeDefined();
      });
    });

    it('should select errors', () => {
      const eligibleNodes = processor.selectEligibleNodes(contract);

      contract.vErrors.forEach((errorNode) => {
        expect(eligibleNodes.find(({ name }) => name === errorNode.name)).toBeDefined();
      });
    });

    it('should select events', () => {
      const eligibleNodes = processor.selectEligibleNodes(contract);

      contract.vEvents.forEach((eventNode) => {
        expect(eligibleNodes.find(({ name }) => name === eventNode.name)).toBeDefined();
      });
    });

    it('should select functions', () => {
      const eligibleNodes = processor.selectEligibleNodes(contract);

      contract.vFunctions.forEach((functionNode) => {
        expect(eligibleNodes.find(({ name }) => name === functionNode.name)).toBeDefined();
      });
    });

    it('should select modifiers', () => {
      const eligibleNodes = processor.selectEligibleNodes(contract);

      contract.vModifiers.forEach((modifierNode) => {
        expect(eligibleNodes.find(({ name }) => name === modifierNode.name)).toBeDefined();
      });
    });

    it('should select state variables', () => {
      const eligibleNodes = processor.selectEligibleNodes(contract);

      contract.vStateVariables.forEach((variableNode) => {
        expect(eligibleNodes.find(({ name }) => name === variableNode.name)).toBeDefined();
      });
    });

    it('should select structs', () => {
      const eligibleNodes = processor.selectEligibleNodes(contract);

      contract.vStructs.forEach((structNode) => {
        expect(eligibleNodes.find(({ name }) => name === structNode.name)).toBeDefined();
      });
    });

    it('should not select using directives', () => {
      const eligibleNodes = processor.selectEligibleNodes(contract);
      expect(eligibleNodes.some((node) => node instanceof UsingForDirective)).toBeFalsy();
    });

    it('should not select user defined value types', () => {
      const eligibleNodes = processor.selectEligibleNodes(contract);
      expect(eligibleNodes.some((node) => node instanceof UserDefinedType)).toBeFalsy();
    });

    it('should select the constructor only once', () => {
      const eligibleNodes = processor.selectEligibleNodes(contract);
      expect(eligibleNodes.filter((node) => node instanceof FunctionDefinition && node.isConstructor).length).toEqual(1);
    });
  });
});
