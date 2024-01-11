import { validate } from '../src/validator';
import { Config } from '../src/utils';
import { getFileCompiledSource } from '../src/utils';
import { NodeToProcess } from "../src/types/solc-typed-ast.t";
import { ContractDefinition } from 'solc-typed-ast';

describe('validator function', () => {
    let contract: ContractDefinition;
    let node: NodeToProcess;

    const config: Config = {
        root: '.',
        contracts: './sample-data',
        enforceInheritdoc: false,
        constructorNatspec: false,
        ignore: []
    };

    beforeAll(async () => {
        const file = 'sample-data/BasicSample.sol';
        const compileResult = await getFileCompiledSource('sample-data/BasicSample.sol');
        contract = compileResult.vContracts[0];
        node = contract.vFunctions.find(({ name }) => name === 'externalSimple')!;
    });

    let natspec = {
        tags: [
            {
                name: 'notice',
                content: 'External function that returns a bool'
            },
            {
                name: 'dev',
                content: 'A dev comment'
            }
        ],
        params: [
            {
                name: '_magicNumber',
                content: 'A parameter description'
            },
            {
                name: '_name',
                content: 'Another parameter description'
            }
        ],
        returns: [
            {
                name: '_isMagic',
                content: 'Some return data'
            },
            {
                name: undefined,
                content: 'Test test'
            }
        ]
    };

    it('should validate proper natspec', () => {
        const result = validate(node, natspec, config);
        expect(result).toEqual([]);
    });

    it('should reveal missing natspec for parameters', () => {
        const paramName = '_magicNumber';
        let natspec = {
            tags: [
                {
                    name: 'notice',
                    content: 'External function that returns a bool'
                }
            ],
            params: [
                {
                    name: '_name',
                    content: 'Another parameter description'
                }
            ],
            returns: [
                {
                    name: '_isMagic',
                    content: 'Some return data'
                }
            ]
        };

        const result = validate(node, natspec, config);
        expect(result).toContainEqual(`@param ${paramName} is missing`);
    });

    it('should reveal missing natspec for returned values', () => {
        const paramName = '_isMagic';
        let natspec = {
            tags: [
                {
                    name: 'notice',
                    content: 'External function that returns a bool'
                },
                {
                    name: 'dev',
                    content: 'A dev comment'
                }
            ],
            params: [
                {
                    name: '_magicNumber',
                    content: 'A parameter description'
                },
                {
                    name: '_name',
                    content: 'Another parameter description'
                }
            ],
            returns: []
        };

        const result = validate(node, natspec, config);
        expect(result).toContainEqual(`@return ${paramName} is missing`);
    });

    it('should reveal missing natspec for unnamed returned values', () => {
        node = contract.vFunctions.find(({ name }) => name === 'externalSimpleMultipleReturn')!;
        let natspec = {
            tags: [
                {
                    name: 'notice',
                    content: 'External function that returns a bool'
                },
                {
                    name: 'dev',
                    content: 'A dev comment'
                }
            ],
            params: [
                {
                    name: '_magicNumber',
                    content: 'A parameter description'
                },
                {
                    name: '_name',
                    content: 'Another parameter description'
                }
            ],
            returns: [
                {
                    name: '_isMagic',
                    content: 'Some return data'
                }
            ]
        };

        const result = validate(node, natspec, config);
        expect(result).toContainEqual(`@return missing for unnamed return`);
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
            returns: []
        };
        const result = validate(node, natspec, config);
        expect(result).toContainEqual(`Natspec is missing`);
    });

    it('should reveal missing natspec for an error', () => {
        node = contract.vErrors.find(({ name }) => name === 'BasicSample_SomeError')!;
        const paramName = '_param1';
        natspec = {
            tags: [
                {
                    name: 'notice',
                    content: 'Some error missing parameter natspec'
                }
            ],
            params: [],
            returns: []
        };
        const result = validate(node, natspec, config);
        expect(result).toContainEqual(`@param ${paramName} is missing`);
    });

    it('should reveal missing natspec for an event', () => {
        node = contract.vEvents.find(({ name }) => name === 'BasicSample_BasicEvent')!;
        const paramName = '_param1';
        natspec = {
            tags: [
                {
                    name: 'notice',
                    content: 'An event missing parameter natspec'
                }
            ],
            params: [],
            returns: []
        };
        const result = validate(node, natspec, config);
        expect(result).toContainEqual(`@param ${paramName} is missing`);
    });

    it('should reveal missing natspec for an modifier', () => {
        node = contract.vModifiers.find(({ name }) => name === 'transferFee')!;
        const paramName = '_receiver';
        natspec = {
            tags: [
                {
                    name: 'notice',
                    content: 'Modifier notice'
                }
            ],
            params: [],
            returns: []
        };
        const result = validate(node, natspec, config);
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
                    content: 'Modifier notice'
                }
            ],
            params: [],
            returns: []
        };
        const result = validate(node, natspec, config);
        expect(result).toContainEqual(`@param ${paramName1} is missing`);
        expect(result).toContainEqual(`@param ${paramName2} is missing`);
    });
});
