import { ContractDefinition } from 'solc-typed-ast';
import { Validator } from '../src/validator';
import { NodeToProcess } from '../src/types';
import { getFileCompiledSource, expectMissingTags } from './utils';
import { mockConfig, mockNatspec } from './mocks';

describe('Validator', () => {
  let contract: ContractDefinition;
  let node: NodeToProcess;
  let validator: Validator = new Validator(mockConfig({}));

  beforeAll(async () => {
    const compileResult = await getFileCompiledSource('test/contracts/BasicSample.sol');
    contract = compileResult.vContracts.find(({ name }) => name === 'BasicSample')!;
  });

  it('should validate proper natspec', () => {
    node = contract.vFunctions.find(({ name }) => name === 'externalSimple')!;
    const natspec = mockNatspec({
      tags: [
        {
          name: 'notice',
          content: 'External function that returns a bool',
        },
        {
          name: 'dev',
          content: 'A dev comment',
        },
      ],
      params: [
        {
          name: '_magicNumber',
          content: 'A parameter description',
        },
        {
          name: '_name',
          content: 'Another parameter description',
        },
      ],
      returns: [
        {
          name: '_isMagic',
          content: 'Some return data',
        },
        {
          name: undefined,
          content: 'Test test',
        },
      ],
    });
    const result = validator.validate(node, natspec);
    expect(result).toEqual([]);
  });

  it('should reveal missing natspec for parameters', () => {
    node = contract.vFunctions.find(({ name }) => name === 'externalSimple')!;
    const paramName = '_magicNumber';
    const natspec = mockNatspec({
      tags: [
        {
          name: 'notice',
          content: 'External function that returns a bool',
        },
      ],
      params: [
        {
          name: '_name',
          content: 'Another parameter description',
        },
      ],
    });
    const result = validator.validate(node, natspec);
    expectMissingTags(result, '@param', 1);
    expect(result).toContainEqual(`@param ${paramName} is missing`);
  });

  it('should reveal missing natspec for returned values', () => {
    const paramName = '_isMagic';
    const natspec = mockNatspec({
      tags: [
        {
          name: 'notice',
          content: 'External function that returns a bool',
        },
      ],
      params: [
        {
          name: '_magicNumber',
          content: 'A parameter description',
        },
        {
          name: '_name',
          content: 'Another parameter description',
        },
      ],
    });
    const result = validator.validate(node, natspec);
    expectMissingTags(result, '@return', 1);
    expect(result).toContainEqual(`@return ${paramName} is missing`);
  });

  it('should reveal missing natspec for unnamed returned values', () => {
    node = contract.vFunctions.find(({ name }) => name === 'externalSimpleMultipleReturn')!;
    const natspec = mockNatspec({
      tags: [
        {
          name: 'notice',
          content: 'External function that returns a bool',
        },
      ],
      returns: [
        {
          name: '_isMagic',
          content: 'Some return data',
        },
      ],
    });

    const result = validator.validate(node, natspec);
    expectMissingTags(result, '@return', 1);
    expect(result).toContainEqual(`@return missing for unnamed return №2`);
  });

  it('should warn of a missing unnamed return', () => {
    node = contract.vFunctions.find(({ name }) => name === 'externalSimpleMultipleUnnamedReturn')!;
    const natspec = mockNatspec({
      tags: [
        {
          name: 'notice',
          content: 'External function that returns a bool',
        },
      ],
      returns: [
        {
          name: 'Some',
          content: 'return data',
        },
      ],
    });

    const result = validator.validate(node, natspec);
    expectMissingTags(result, '@return', 1);
    expect(result).toContainEqual(`@return missing for unnamed return №2`);
  });

  it('should warn all returns if the first natspec tag is missing', () => {
    node = contract.vFunctions.find(({ name }) => name === 'externalSimpleMultipleReturn')!;
    const natspec = mockNatspec({
      tags: [
        {
          name: 'notice',
          content: 'External function that returns a bool',
        },
      ],
      returns: [
        {
          name: 'Some',
          content: 'return data',
        },
      ],
    });

    const result = validator.validate(node, natspec);
    expectMissingTags(result, '@return', 2);
    expect(result).toContainEqual(`@return _isMagic is missing`);
    expect(result).toContainEqual(`@return missing for unnamed return №2`);
  });

  it('should warn if the last natspec tag is missing', () => {
    node = contract.vFunctions.find(({ name }) => name === 'externalSimpleMultipleReturn')!;
    const natspec = mockNatspec({
      tags: [
        {
          name: 'notice',
          content: 'External function that returns a bool',
        },
      ],
      returns: [
        {
          name: '_isMagic',
          content: 'Some return data',
        },
      ],
    });

    const result = validator.validate(node, natspec);
    expectMissingTags(result, '@return', 1);
    expect(result).toContainEqual(`@return missing for unnamed return №2`);
  });

  // TODO: Check overridden functions, virtual, etc?
  // it('should reveal missing natspec for an external function');
  // it('should reveal missing natspec for a public function');
  // it('should reveal missing natspec for a private function');
  // it('should reveal missing natspec for an internal function');

  it('should reveal missing natspec for a variable', () => {
    node = contract.vStateVariables.find(({ name }) => name === '_EMPTY_STRING')!;
    const result = validator.validate(node, mockNatspec({}));
    expect(result).toContainEqual(`Natspec is missing`);
  });

  it('should reveal missing natspec for an error', () => {
    node = contract.vErrors.find(({ name }) => name === 'BasicSample_SomeError')!;
    const paramName = '_param1';
    const natspec = mockNatspec({
      tags: [
        {
          name: 'notice',
          content: 'Some error missing parameter natspec',
        },
      ],
    });
    const result = validator.validate(node, natspec);
    expectMissingTags(result, '@param', 1);
    expect(result).toContainEqual(`@param ${paramName} is missing`);
  });

  it('should reveal missing natspec for an event', () => {
    node = contract.vEvents.find(({ name }) => name === 'BasicSample_BasicEvent')!;
    const paramName = '_param1';
    const natspec = mockNatspec({
      tags: [
        {
          name: 'notice',
          content: 'An event missing parameter natspec',
        },
      ],
    });
    const result = validator.validate(node, natspec);
    expectMissingTags(result, '@param', 1);
    expect(result).toContainEqual(`@param ${paramName} is missing`);
  });

  it('should reveal missing natspec for an modifier', () => {
    node = contract.vModifiers.find(({ name }) => name === 'transferFee')!;
    const paramName = '_receiver';
    const natspec = mockNatspec({
      tags: [
        {
          name: 'notice',
          content: 'Modifier notice',
        },
      ],
    });
    const result = validator.validate(node, natspec);
    expect(result).toContainEqual(`@param ${paramName} is missing`);
  });

  it('should reveal missing natspec for a struct', () => {
    node = contract.vStructs.find(({ name }) => name === 'TestStruct')!;
    const paramName1 = 'someAddress';
    const paramName2 = 'someNumber';
    const natspec = mockNatspec({
      tags: [
        {
          name: 'notice',
          content: 'Modifier notice',
        },
      ],
    });
    const result = validator.validate(node, natspec);
    expectMissingTags(result, '@param', 2);
    expect(result).toContainEqual(`@param ${paramName1} is missing`);
    expect(result).toContainEqual(`@param ${paramName2} is missing`);
  });

  it('should ignore the receive function', () => {
    node = contract.vFunctions.find(({ kind }) => kind === 'receive')!;
    const result = validator.validate(node, mockNatspec({}));
    expect(result).toEqual([]);
  });

  it('should ignore the callback function', () => {
    node = contract.vFunctions.find(({ kind }) => kind === 'fallback')!;
    const result = validator.validate(node, mockNatspec({}));
    expect(result).toEqual([]);
  });

  describe('with enforced inheritdoc', () => {
    beforeAll(async () => {
      validator = new Validator(mockConfig({ enforceInheritdoc: true }));
    });

    it('should reveal missing inheritdoc for an overridden function', () => {
      node = contract.vFunctions.find(({ name }) => name === 'overriddenFunction')!;
      const result = validator.validate(node, mockNatspec({}));
      expect(result).toContainEqual(`@inheritdoc is missing`);
    });

    it('should reveal missing inheritdoc for a virtual function', () => {
      node = contract.vFunctions.find(({ name }) => name === 'virtualFunction')!;
      const result = validator.validate(node, mockNatspec({}));
      expect(result).toContainEqual(`@inheritdoc is missing`);
    });
  });
});
