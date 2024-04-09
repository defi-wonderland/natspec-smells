import fs from 'fs/promises';
import { faker } from '@faker-js/faker';
import { Processor, IWarning } from '../src/processor';
import * as utils from '../src/utils';
import { Validator } from '../src/validator';
import { mockFunctionDefinition, mockNodeToProcess, mockConfig, mockNatspec } from './utils/mocks';
import { getFileCompiledSource } from './utils/helpers';
import { ContractDefinition, FunctionDefinition, UserDefinedType, UsingForDirective, FunctionKind } from 'solc-typed-ast';
import { NodeNatspecParser } from '../src/NodeNatspecParser';

describe('Processor', () => {
  const validator = new Validator(mockConfig({}));
  const parser = new NodeNatspecParser();
  const processor = new Processor(validator, parser);

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
      const parseNodeNatspecSpy = jest.spyOn(parser, 'parse').mockImplementation((_) => nodeNatspec);

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
    let absolutePath: string;
    let contractName: string;
    let nodeName: string;
    let fileContent: string;
    let lineNumber: number;
    let src: string;
    let getLineNumberFromSrcSpy: any;

    beforeEach(async () => {
      absolutePath = faker.system.filePath();
      contractName = faker.lorem.word();
      nodeName = faker.lorem.word();
      fileContent = faker.lorem.sentence();
      lineNumber = faker.number.int(100);
      src = `${lineNumber}:1:0`;
      getLineNumberFromSrcSpy = jest.spyOn(utils, 'getLineNumberFromSrc').mockImplementation(() => lineNumber);
    });

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

  describe('processSources', () => {
    let absolutePath: string;
    let fileContent: string;
    let fakeSourceUnits: any;
    let spySelectEligibleNodes: any;
    let spyValidateNatspec: any;
    let spyFormatLocation: any;

    const fakeSourcesLength: number = 2;
    const fakeContractsLength: number = 3;
    const fakeNodesLength: number = 4;

    beforeEach(async () => {
      absolutePath = faker.system.filePath();
      fileContent = faker.lorem.sentence();

      fakeSourceUnits = new Array(fakeSourcesLength);
      fakeSourceUnits.fill({
        absolutePath: absolutePath,
        vContracts: new Array(fakeContractsLength).fill({ name: 'mockContract' }),
      });
      spySelectEligibleNodes = jest.spyOn(processor, 'selectEligibleNodes');
      spyValidateNatspec = jest.spyOn(processor, 'validateNatspec');
      spyFormatLocation = jest.spyOn(processor, 'formatLocation');
    });

    it('should return correct sources', async () => {
      fs.readFile = jest.fn().mockResolvedValue(fileContent);
      spySelectEligibleNodes.mockReturnValue(new Array(fakeNodesLength));
      spyValidateNatspec.mockReturnValue(['mockMessage']);
      spyFormatLocation.mockReturnValue('mockLocation');

      const warnings: IWarning[] = await processor.processSources(fakeSourceUnits);
      expect(warnings).toHaveLength(fakeSourcesLength * fakeContractsLength * fakeNodesLength);
      expect(warnings.every((warning) => warning.messages.includes('mockMessage'))).toBeTruthy();
      expect(warnings.every((warning) => warning.location === 'mockLocation')).toBeTruthy();
    });
  });
});
