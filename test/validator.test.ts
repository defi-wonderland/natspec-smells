import { validate } from '../src/validator';
import { parseSolidityFile } from '../test/test-utils';
import { SolcContractNode } from "../src/types/solc-typed-ast.t";

describe('validator function', () => {
    let nodes: SolcContractNode[];
    let functionParsedData: SolcContractNode;

    beforeAll(async () => {
        const file = 'sample-data/BasicSample.sol';
        const compileResult = await parseSolidityFile(file);
        nodes = compileResult.data.sources[file].ast.nodes[1].nodes as SolcContractNode[];
        functionParsedData = nodes[1];
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
        const result = validate(functionParsedData, natspec);
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

        const result = validate(functionParsedData, natspec);
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

        const result = validate(functionParsedData, natspec);
        expect(result).toContainEqual(`@return ${paramName} is missing`);
    });

    // it('should reveal extra natspec for returned values', () => {
    //     const paramName = 'someValue';
    //     natspec.returns.push({
    //         name: paramName,
    //         content: 'Some text'
    //     });

    //     const result = validate(functionParsedData, natspec);
    //     expect(result).toContainEqual(`Found natspec for undefined returned value ${paramName}`);
    // });

    it('should reveal missing natspec for unnamed returned values', () => {
        functionParsedData = nodes[5];
        const paramName = '';
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

        const result = validate(functionParsedData, natspec);
        expect(result).toContainEqual(`@return missing for unnamed return`);
    });

    // TODO: Check overridden functions, virtual, etc?
    // it('should reveal missing natspec for an external function');
    // it('should reveal missing natspec for a public function');
    // it('should reveal missing natspec for a private function');
    // it('should reveal missing natspec for an internal function');
    
    it('should reveal missing natspec for a variable', () => {
        functionParsedData = nodes[0];
        natspec = {
            tags: [],
            params: [],
            returns: []
        };
        const result = validate(functionParsedData, natspec);
        expect(result).toContainEqual(`Natspec is missing`);
    });
});
