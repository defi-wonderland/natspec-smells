import { parseNodeNatspec } from '../src/parser';
import { SolcContractNode } from '../src/types/solc-typed-ast.t';
import { parseSolidityFile } from './test-utils';

describe.only('parseNodeNatspec', () => {

    describe('sample.sol', () => {
        let nodes: SolcContractNode[];

        beforeAll(async () => {
            const file = 'sample-data/sample.sol';
            const compileResult = await parseSolidityFile(file);
            nodes = compileResult.data.sources[file].ast.nodes[1].nodes as SolcContractNode[];
        });

        it('should parse constant', async () => {
            const emptyStringNode = nodes[0];
            const result = parseNodeNatspec(emptyStringNode);
            expect(result).toEqual({
                tags: [{
                    name: 'notice',
                    description: 'Empty string for revert checks',
                }, {
                    name: 'dev',
                    description: `result of doing keccak256(bytes(''))`,
                }],
                params: [],
                returns: [],
            });
        });
    
        it('should parse a fully natspeced external function', async () => {
            const functionNode = nodes[1];
            const result = parseNodeNatspec(functionNode);

            expect(result).toEqual({
                tags: [{
                    name: 'notice',
                    description: 'External function that returns a bool',
                }, {
                    name: 'dev',
                    description: 'A dev comment',
                }],
                params: [{
                    name: '_magicNumber',
                    description: 'A parameter description',
                }, {
                    name: '_name',
                    description: 'Another parameter description',
                }],
                returns: [{
                    name: '_isMagic',
                    description: 'Some return data',
                }],
            });
        });
    
        it('should parse a fully natspeced internal function', async () => {
            const functionNode = nodes[2];
            const result = parseNodeNatspec(functionNode);

            expect(result).toEqual({
                tags: [{
                    name: 'notice',
                    description: 'Private test function',
                }],
                params: [{
                    name: '_magicNumber',
                    description: 'A parameter description',
                }],
                returns: [],
            });
        });
    });
});
