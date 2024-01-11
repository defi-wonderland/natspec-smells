import { ContractDefinition } from 'solc-typed-ast';
import { parseNodeNatspec } from '../src/parser';
import { getFileCompiledSource } from '../src/utils';

describe('parseNodeNatspec', () => {

    describe('BasicSample.sol', () => {
        let contract: ContractDefinition;

        beforeAll(async () => {
            const compileResult = await getFileCompiledSource('sample-data/BasicSample.sol');
            contract = compileResult.vContracts[0];
        });

        it('should parse struct', async () => {
            const structNode = contract.vStructs.find(({ name }) => name === 'TestStruct')!;
            const result = parseNodeNatspec(structNode);

            expect(result).toEqual({
                tags: [{
                    name: 'notice',
                    content: 'Some notice of the struct',
                }],
                params: [],
                returns: [],
            });
        });

        it('should parse constant', async () => {
            const emptyStringNode = contract.vStateVariables.find(({ name }) => name === '_EMPTY_STRING')!;
            const result = parseNodeNatspec(emptyStringNode);

            expect(result).toEqual({
                tags: [{
                    name: 'notice',
                    content: 'Empty string for revert checks',
                }, {
                    name: 'dev',
                    content: `result of doing keccak256(bytes(''))`,
                }],
                params: [],
                returns: [],
            });
        });
    
        it('should parse a fully natspeced external function', async () => {
            const functionNode = contract.vFunctions.find(({ name }) => name === 'externalSimple')!;
            const result = parseNodeNatspec(functionNode);

            expect(result).toEqual({
                tags: [{
                    name: 'notice',
                    content: 'External function that returns a bool',
                }, {
                    name: 'dev',
                    content: 'A dev comment',
                }],
                params: [{
                    name: '_magicNumber',
                    content: 'A parameter description',
                }, {
                    name: '_name',
                    content: 'Another parameter description',
                }],
                returns: [{
                    name: '_isMagic',
                    content: 'Some return data',
                }],
            });
        });
    
        it('should parse a fully natspeced private function', async () => {
            const functionNode = contract.vFunctions.find(({ name }) => name === 'privateSimple')!;
            const result = parseNodeNatspec(functionNode);

            expect(result).toEqual({
                tags: [{
                    name: 'notice',
                    content: 'Private test function',
                }],
                params: [{
                    name: '_magicNumber',
                    content: 'A parameter description',
                }],
                returns: [],
            });
        });

        it('should parse multiline descriptions', async () => {
            const functionNode = contract.vFunctions.find(({ name }) => name === 'multiline')!;
            const result = parseNodeNatspec(functionNode);

            expect(result).toEqual({
                tags: [{
                    name: 'notice',
                    content: 'Private test function\n         with multiple\n lines',
                }],
                params: [],
                returns: [],
            });
        });

        it('should parse multiple of the same tag', async () => {
            const functionNode = contract.vFunctions.find(({ name }) => name === 'multitag')!;
            const result = parseNodeNatspec(functionNode);

            expect(result).toEqual({
                tags: [{
                    name: 'notice',
                    content: 'Private test function',
                }, {
                    name: 'notice',
                    content: 'Another notice',
                }],
                params: [],
                returns: [],
            });
        });
    });

    describe('InterfacedSample.sol', () => {
        let contract: ContractDefinition;

        beforeAll(async () => {
            const compileResult = await getFileCompiledSource('sample-data/InterfacedSample.sol');
            contract = compileResult.vContracts[1];
        });


        it('should parse the inheritdoc tag', async () => {
            const functionNode = contract.vFunctions.find(({ name }) => name === 'greet')!;
            const result = parseNodeNatspec(functionNode);

            expect(result).toEqual({
                inheritdoc: {
                    content: 'IInterfacedSample',
                },
                tags: [{
                    name: 'dev',
                    content: 'some dev thingy',
                }],
                params: [],
                returns: [],
            });
        });
    });
});