import { validate } from '../src/validator';
import { parseSolidityFile } from '../test/test-utils';
import { resolve} from 'path';
import { Natspec } from '../src/types/natspec.t';
import { SolcContractNode } from "../src/types/solc-typed-ast.t";

const SOLIDITY_FILE_PATH = resolve(__dirname, '..', 'sample-data', 'sample.sol');

describe.only('validator function', () => {
    let nodes: SolcContractNode[];
    let functionParsedData: SolcContractNode;

    beforeAll(async () => {
        const file = 'sample-data/sample.sol';
        const compileResult = await parseSolidityFile(file);
        nodes = compileResult.data.sources[file].ast.nodes[1].nodes as SolcContractNode[];
        functionParsedData = nodes[1];
    });

    let natspec = {
        tags: [
            {
                'name': 'notice',
                'description': 'External function that returns a bool'
            },
            {
                'name': 'dev',
                'description': 'A dev comment'
            }
        ],
        params: [
            {
                'name': '_magicNumber',
                'description': 'A parameter description'
            },
            {
                'name': '_name',
                'description': 'Another parameter description'
            }
        ],
        returns: [
            {
                'name': '_isMagic',
                'description': 'Some return data'
            },
            {
                'name': undefined,
                'description': 'Test test'
            }
        ]
    };

    it('should validate proper natspec', () => {
        const result = validate(functionParsedData, natspec);
        expect(result).toEqual([]);
    });

    it('should reveal missing natspec for parameters', () => {
        const parameter = '_magicNumber';
        let natspec = {
            tags: [
                {
                    'name': 'notice',
                    'description': 'External function that returns a bool'
                }
            ],
            params: [
                {
                    'name': '_name',
                    'description': 'Another parameter description'
                }
            ],
            returns: [
                {
                    'name': '_isMagic',
                    'description': 'Some return data'
                }
            ]
        };

        const result = validate(functionParsedData, natspec);
        expect(result).toContainEqual({
            message: `Natspec for ${parameter} is missing`,
            severity: 'error',
        });
    });

    it('should reveal extra natspec for parameters', () => {
        const parameter = 'someParameter';
        const natspec = {
            tags: [],
            params: [
                {
                    'name': parameter,
                    'description': 'Some text'
                }
            ],
            returns: []
        };

      const result = validate(functionParsedData, natspec);
      expect(result).toContainEqual({
            severity: 'error',
            message: `Found natspec for undefined function parameter ${parameter}`,
      });
    });

    it('should reveal missing natspec for returned values', () => {
        const returnedValue = '_isMagic';
        let natspec = {
            tags: [
                {
                    'name': 'notice',
                    'description': 'External function that returns a bool'
                },
                {
                    'name': 'dev',
                    'description': 'A dev comment'
                }
            ],
            params: [
                {
                    'name': '_magicNumber',
                    'description': 'A parameter description'
                },
                {
                    'name': '_name',
                    'description': 'Another parameter description'
                }
            ],
            returns: []
        };

        const result = validate(functionParsedData, natspec);
        expect(result).toContainEqual({
            severity: 'error',
            message: `Natspec for ${returnedValue} is missing`,
        });
    });

    it('should reveal extra natspec for returned values', () => {
        const returnedValue = 'someValue';
        natspec.returns.push({
            'name': returnedValue,
            'description': 'Some text'
        });

        const result = validate(functionParsedData, natspec);
        expect(result).toContainEqual({
            severity: 'error',
            message: `Found natspec for undefined returned value ${returnedValue}`,
        });
    });

    // TODO: In these 2 tests, we're checking just the number of elements in `params` or `returns` that have no name
    // it('should reveal missing natspec for unnamed parameters values', () => {
    //     const natspec = {
    //         tags: [],
    //         params: [],
    //         returns: []
    //     };

    //     const result = validate(functionParsedData, natspec);
    //     expect(result).toContainEqual({
    //         severity: 'error',
    //         message: `Natspec for a parameter is missing`,
    //     });
    // });

    // it('should reveal missing natspec for unnamed returned values', () => {
    //     const returnedValue = '';
    //     let natspec = {
    //         tags: [
    //             {
    //                 'name': 'notice',
    //                 'description': 'External function that returns a bool'
    //             },
    //             {
    //                 'name': 'dev',
    //                 'description': 'A dev comment'
    //             }
    //         ],
    //         params: [
    //             {
    //                 'name': '_magicNumber',
    //                 'description': 'A parameter description'
    //             },
    //             {
    //                 'name': '_name',
    //                 'description': 'Another parameter description'
    //             }
    //         ],
    //         returns: [
    //             {
    //                 'name': '_isMagic',
    //                 'description': 'Some return data'
    //             }
    //         ]
    //     };

    //     const result = validate(functionParsedData, natspec);
    //     expect(result).toContainEqual({
    //         severity: 'error',
    //         message: `Natspec for a return parameter is missing`,
    //     });
    // });

    // TODO: Check overridden functions, virtual, etc?
    // it('should reveal missing natspec for an external function');
    // it('should reveal missing natspec for a public function');
    // it('should reveal missing natspec for a private function');
    // it('should reveal missing natspec for an internal function');
    
    // it('should reveal missing natspec for a variable');
    // it('should reveal missing natspec for a constant');
    // it('should reveal missing natspec for a an immutable variable');
});
