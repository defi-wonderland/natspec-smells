import { faker } from '@faker-js/faker';
import { ContractDefinition, FunctionDefinition, UserDefinedType, UsingForDirective, FunctionKind } from 'solc-typed-ast';
import * as utils from '../src/utils';
import { Processor } from '../src/processor';
import { Validator } from '../src/validator';
import { getFileCompiledSource } from './utils';
import { mockFunctionDefinition, mockNodeToProcess, mockConfig, mockNatspec } from './mocks';

describe('Processor', () => {
  const validator = new Validator(mockConfig({}));
  const processor = new Processor(validator);

  describe('selectEligibleNodes', () => {
    let contract: ContractDefinition;

    beforeAll(async () => {
      const compileResult = await getFileCompiledSource('test/contracts/ParserTest.sol');
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

  describe('validateNatspec', () => {
    const node = mockNodeToProcess({});
    const nodeNatspec = mockNatspec({});

    it('should parse the natspec of the node', () => {
      const parseNodeNatspecSpy = jest.spyOn(utils, 'parseNodeNatspec').mockImplementation((_) => nodeNatspec);

      processor.validateNatspec(node);

      expect(parseNodeNatspecSpy).toHaveBeenCalledWith(node);
    });

    it('should validate the natspec of the node', () => {
      const messages = [faker.lorem.sentence(), faker.lorem.sentence()];
      const validateSpy = jest.spyOn(validator, 'validate').mockImplementation((_, __) => messages);

      const validatedNatspec = processor.validateNatspec(node);

      expect(validatedNatspec).toEqual(messages);
      expect(validateSpy).toHaveBeenCalledWith(node, nodeNatspec);
    });
  });

  describe('formatLocation', () => {
    const absolutePath = faker.system.filePath();
    const contractName = faker.lorem.word();
    const nodeName = faker.lorem.word();
    const fileContent = faker.lorem.sentence();
    const lineNumber = faker.number.int(100);
    const src = '${lineNumber}:1:0';
    const getLineNumberFromSrcSpy = jest.spyOn(utils, 'getLineNumberFromSrc').mockImplementation(() => lineNumber);

    it('should format the location of a node', () => {
      const node = mockNodeToProcess({ name: nodeName, src: src });
      const formattedLocation = processor.formatLocation(absolutePath, fileContent, contractName, node);

      expect(getLineNumberFromSrcSpy).toHaveBeenCalledWith(fileContent, src);
      expect(formattedLocation).toEqual(`${absolutePath}:${lineNumber}\n${contractName}:${nodeName}`);
    });

    it('should format the location of a constructor', () => {
      const node = mockFunctionDefinition({ kind: FunctionKind.Constructor, src: src });
      const formattedLocation = processor.formatLocation(absolutePath, fileContent, contractName, node);

      expect(getLineNumberFromSrcSpy).toHaveBeenCalledWith(fileContent, src);
      expect(formattedLocation).toEqual(`${absolutePath}:${lineNumber}\n${contractName}:constructor`);
    });

    it('should format the location of a function', () => {
      const node = mockFunctionDefinition({ name: nodeName, src: src });
      const formattedLocation = processor.formatLocation(absolutePath, fileContent, contractName, node);

      expect(getLineNumberFromSrcSpy).toHaveBeenCalledWith(fileContent, src);
      expect(formattedLocation).toEqual(`${absolutePath}:${lineNumber}\n${contractName}:${nodeName}`);
    });
  });
});
