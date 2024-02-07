import { ContractDefinition } from 'solc-typed-ast';
import { Validator } from '../src/validator';
import { getFileCompiledSource } from './utils';
import { Config, NodeToProcess } from '../src/types';
import { before } from 'node:test';

describe('Validator', () => {
  let contract: ContractDefinition;
  let node: NodeToProcess;

  let config: Config = {
    root: '.',
    include: './sample-data',
    exclude: '',
    enforceInheritdoc: false,
    constructorNatspec: false,
  };

  let validator: Validator = new Validator(config);

  beforeAll(async () => {
    const compileResult = await getFileCompiledSource('sample-data/BasicSample.sol');
    contract = compileResult.vContracts.find(({ name }) => name === 'BasicSample')!;
  });

  let natspec = {
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
  };

  it('should validate proper natspec', () => {
    node = contract.vFunctions.find(({ name }) => name === 'externalSimple')!;

    const result = validator.validate(node, natspec);
    expect(result).toEqual([]);
  });

  it('should reveal missing natspec for parameters', () => {
    node = contract.vFunctions.find(({ name }) => name === 'externalSimple')!;
    const paramName = '_magicNumber';
    let natspec = {
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
      returns: [
        {
          name: '_isMagic',
          content: 'Some return data',
        },
      ],
    };

    const result = validator.validate(node, natspec);
    expect(result).toContainEqual(`@param ${paramName} is missing`);
  });

  it('should reveal missing natspec for returned values', () => {
    const paramName = '_isMagic';
    let natspec = {
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
      returns: [],
    };

    const result = validator.validate(node, natspec);
    expect(result).toContainEqual(`@return ${paramName} is missing`);
  });

  it('should reveal missing natspec for unnamed returned values', () => {
    node = contract.vFunctions.find(({ name }) => name === 'externalSimpleMultipleReturn')!;
    let natspec = {
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
      ],
    };

    const result = validator.validate(node, natspec);
    expect(result).toContainEqual(`@return missing for unnamed return №2`);
  });

  it('should warn of a missing unnamed return', () => {
    node = contract.vFunctions.find(({ name }) => name === 'externalSimpleMultipleUnnamedReturn')!;
    let natspec = {
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
      params: [],
      returns: [
        {
          name: 'Some',
          content: 'return data',
        },
      ],
    };

    const result = validator.validate(node, natspec);
    expect(result).toEqual([`@return missing for unnamed return №2`]); // only 1 warning
  });

  it('should warn all returns if the first natspec tag is missing', () => {
    node = contract.vFunctions.find(({ name }) => name === 'externalSimpleMultipleReturn')!;
    let natspec = {
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
          name: 'Some',
          content: 'return data',
        },
      ],
    };

    const result = validator.validate(node, natspec);
    expect(result).toEqual(['@return _isMagic is missing', '@return missing for unnamed return №2']); // 2 warnings
  });

  it('should warn if the last natspec tag is missing', () => {
    node = contract.vFunctions.find(({ name }) => name === 'externalSimpleMultipleReturn')!;
    let natspec = {
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
      ],
    };

    const result = validator.validate(node, natspec);
    expect(result).toEqual(['@return missing for unnamed return №2']); // 1 warnings
  });

  // TODO: Check overridden functions, virtual, etc?
  // it('should reveal missing natspec for an external function');
  // it('should reveal missing natspec for a public function');
  // it('should reveal missing natspec for a private function');
  // it('should reveal missing natspec for an internal function');

  it('should reveal missing natspec for a variable', () => {
    node = contract.vStateVariables.find(({ name }) => name === '_EMPTY_STRING')!;
    natspec = {
      tags: [],
      params: [],
      returns: [],
    };
    const result = validator.validate(node, natspec);
    expect(result).toContainEqual(`Natspec is missing`);
  });

  it('should reveal missing natspec for an error', () => {
    node = contract.vErrors.find(({ name }) => name === 'BasicSample_SomeError')!;
    const paramName = '_param1';
    natspec = {
      tags: [
        {
          name: 'notice',
          content: 'Some error missing parameter natspec',
        },
      ],
      params: [],
      returns: [],
    };
    const result = validator.validate(node, natspec);
    expect(result).toContainEqual(`@param ${paramName} is missing`);
  });

  it('should reveal missing natspec for an event', () => {
    node = contract.vEvents.find(({ name }) => name === 'BasicSample_BasicEvent')!;
    const paramName = '_param1';
    natspec = {
      tags: [
        {
          name: 'notice',
          content: 'An event missing parameter natspec',
        },
      ],
      params: [],
      returns: [],
    };
    const result = validator.validate(node, natspec);
    expect(result).toContainEqual(`@param ${paramName} is missing`);
  });

  it('should reveal missing natspec for an modifier', () => {
    node = contract.vModifiers.find(({ name }) => name === 'transferFee')!;
    const paramName = '_receiver';
    natspec = {
      tags: [
        {
          name: 'notice',
          content: 'Modifier notice',
        },
      ],
      params: [],
      returns: [],
    };
    const result = validator.validate(node, natspec);
    expect(result).toContainEqual(`@param ${paramName} is missing`);
  });

  it('should reveal missing natspec for a struct', () => {
    node = contract.vStructs.find(({ name }) => name === 'TestStruct')!;
    const paramName1 = 'someAddress';
    const paramName2 = 'someNumber';
    natspec = {
      tags: [
        {
          name: 'notice',
          content: 'Modifier notice',
        },
      ],
      params: [],
      returns: [],
    };
    const result = validator.validate(node, natspec);
    expect(result).toContainEqual(`@param ${paramName1} is missing`);
    expect(result).toContainEqual(`@param ${paramName2} is missing`);
  });

  it('should ignore receive and fallback', () => {
    node = contract.vFunctions.find(({ kind }) => kind === 'receive' || kind === 'fallback')!;
    natspec = {
      tags: [],
      params: [],
      returns: [],
    };
    const result = validator.validate(node, natspec);
    expect(result).toEqual([]);
  });

  describe('with enforced inheritdoc', () => {
    beforeAll(async () => {
      config = {
        root: '.',
        include: './sample-data',
        exclude: '',
        enforceInheritdoc: true,
        constructorNatspec: false,
      };

      validator = new Validator(config);
    });

    it('should reveal missing inheritdoc for an overridden function', () => {
      node = contract.vFunctions.find(({ name }) => name === 'overriddenFunction')!;
      natspec = {
        tags: [],
        params: [],
        returns: [],
      };
      const result = validator.validate(node, natspec);
      expect(result).toContainEqual(`@inheritdoc is missing`);
    });

    it('should reveal missing inheritdoc for a virtual function', () => {
      node = contract.vFunctions.find(({ name }) => name === 'virtualFunction')!;
      natspec = {
        tags: [],
        params: [],
        returns: [],
      };
      const result = validator.validate(node, natspec);
      expect(result).toContainEqual(`@inheritdoc is missing`);
    });
  });
});
