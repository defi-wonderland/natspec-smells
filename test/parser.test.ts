import { parseNodeNatspec } from '../src/parser';
import { SolcContractNode } from '../src/types/solc-typed-ast.t';
import { parseSolidityFile } from './test-utils';

describe('parseNodeNatspec', () => {

    describe('BasicSample.sol', () => {
        let nodes: SolcContractNode[];

        beforeAll(async () => {
            const file = 'sample-data/BasicSample.sol';
            const compileResult = await parseSolidityFile(file);
            nodes = compileResult.data.sources[file].ast.nodes[1].nodes as SolcContractNode[];
        });

        it('should parse struct', async () => {
            const emptyStringNode = nodes[0];
            const result = parseNodeNatspec(emptyStringNode);

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
            const emptyStringNode = nodes[1];
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
            const functionNode = nodes[2];
            const result = parseNodeNatspec(functionNode);

            console.log(result);

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
    
        it('should parse a fully natspeced internal function', async () => {
            const functionNode = nodes[3];
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
            const functionNode = nodes[4];
            const result = parseNodeNatspec(functionNode);
            console.log(result);

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
            const functionNode = nodes[5];
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
        let nodes: SolcContractNode[];

        beforeAll(async () => {
            const file = 'sample-data/InterfacedSample.sol';
            const compileResult = await parseSolidityFile(file);
            nodes = compileResult.data.sources[file].ast.nodes[2].nodes as SolcContractNode[];
        });

        it('should parse the inheritdoc tag', async () => {
            const functionNode = nodes[0];
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
