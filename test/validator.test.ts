import { validate } from '../src/validator';
import { parseSolidityFile } from '../test/test-utils';
import { resolve} from 'path';
import { Natspec } from '../src/types/natspec.t';
import { SolcContractNode } from "../src/types/solc-typed-ast.t";

const SOLIDITY_FILE_PATH = resolve(__dirname, '..', 'sample-data', 'sample.sol');

/*
{
    "body": {
        "id": 15,
        "nodeType": "Block",
        "src": "554:22:0",
        "statements": [
            {
                "expression": {
                    "hexValue": "74727565",
                    "id": 13,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": true,
                    "kind": "bool",
                    "lValueRequested": false,
                    "nodeType": "Literal",
                    "src": "567:4:0",
                    "typeDescriptions": {
                        "typeIdentifier": "t_bool",
                        "typeString": "bool"
                    },
                    "value": "true"
                },
                "functionReturnParameters": 12,
                "id": 14,
                "nodeType": "Return",
                "src": "560:11:0"
            }
        ]
    },
    "documentation": {
        "id": 6,
        "nodeType": "StructuredDocumentation",
        "src": "294:189:0",
        "text": " @notice Empty bytes for revert checks\n @dev A dev comment\n @dev Another dev comment\n @param _param A parameter description\n @return _bla Some return data"
    },
    "functionSelector": "0a2c783a",
    "id": 16,
    "implemented": true,
    "kind": "function",
    "modifiers": [],
    "name": "something",
    "nameLocation": "495:9:0",
    "nodeType": "FunctionDefinition",
    "parameters": {
        "id": 9,
        "nodeType": "ParameterList",
        "parameters": [
            {
                "constant": false,
                "id": 8,
                "mutability": "mutable",
                "name": "_param",
                "nameLocation": "513:6:0",
                "nodeType": "VariableDeclaration",
                "scope": 16,
                "src": "505:14:0",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                },
                "typeName": {
                    "id": 7,
                    "name": "uint256",
                    "nodeType": "ElementaryTypeName",
                    "src": "505:7:0",
                    "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                    }
                },
                "visibility": "internal"
            }
        ],
        "src": "504:16:0"
    },
    "returnParameters": {
        "id": 12,
        "nodeType": "ParameterList",
        "parameters": [
            {
                "constant": false,
                "id": 11,
                "mutability": "mutable",
                "name": "_bla",
                "nameLocation": "548:4:0",
                "nodeType": "VariableDeclaration",
                "scope": 16,
                "src": "543:9:0",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                    "typeIdentifier": "t_bool",
                    "typeString": "bool"
                },
                "typeName": {
                    "id": 10,
                    "name": "bool",
                    "nodeType": "ElementaryTypeName",
                    "src": "543:4:0",
                    "typeDescriptions": {
                        "typeIdentifier": "t_bool",
                        "typeString": "bool"
                    }
                },
                "visibility": "internal"
            }
        ],
        "src": "542:11:0"
    },
    "scope": 17,
    "src": "486:90:0",
    "stateMutability": "view",
    "virtual": false,
    "visibility": "external"
}
*/

// const sampleData = {
//     tags: [
//         {
//             'name': 'notice',
//             'description': 'Empty string for revert checks'
//         },
//         {
//             'name': 'notice',
//             'description': 'Empty string for revert checks'
//         },
//         {
//             'name': 'dev',
//             'description': 'Empty string for revert checks'
//         },
//         {
//             'name': 'dev',
//             'description': '     Empty string for revert checks'
//         },
//         {
//             'name': 'home',
//             'description': '     Empty string for revert checks'
//         }
//     ],
//     params: [
//         {
//             'name': '_param',
//             'description': 'A parameter description'
//         },
//         {
//             'name': '_param',
//             'description': 'A parameter description'
//         },
//     ],
//     returns: [
//         {
//             'name': undefined,
//             'description': 'A parameter description'
//         },
//         {
//             'name': 'variable',
//             'description': 'A parameter description'
//         }
//     ]
// };

// /**
//  * @notice External function that returns a bool
//  * @dev A dev comment
//  * @param _magicNumber A parameter description
//  * @param _name Another parameter description
//  * @return _isMagic Some return data
//  */
// function function1(uint256 _magicNumber, string memory _name) external pure returns(bool _isMagic) {
//   return true;
// }

describe('validator function', () => {
    let nodes: SolcContractNode[];
    let functionParsedData: SolcContractNode;

    beforeAll(async () => {
        const file = 'sample-data/sample.sol';
        const compileResult = await parseSolidityFile(file);
        nodes = compileResult.data.sources[file].ast.nodes[1].nodes as SolcContractNode[];
        functionParsedData = nodes[0];
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
            }
        ]
    };

    it('should validate proper natspec', () => {
        const result = validate(functionParsedData, natspec);
        expect(result).toEqual([]);
    });

    // it('should reveal missing natspec for parameters', () => {
    //     const parameter = 'someParameter';
    //     const result = validate(functionParsedData, natspec);
    //     expect(result).toContain({
    //         severity: 'error',
    //         message: `Natspec for ${parameter} is missing`,
    //     });
    // });

    // it('should reveal extra natspec for parameters', () => {
    //     const parameter = 'someParameter';
    //     const natspec = {
    //         tags: [],
    //         params: [
    //             {
    //                 'name': parameter,
    //                 'description': 'Some text'
    //             }
    //         ],
    //         returns: []
    //     };

    //   const result = validate(functionParsedData, natspec);
    //   expect(result).toContain({
    //         severity: 'error',
    //         message: `Found natspec for undefined function parameter ${parameter}`,
    //   });
    // });

    // it('should reveal missing natspec for returned values', () => {
    //     const returnedValue = '_isMagic';
    //     const natspec = {
    //         tags: [],
    //         params: [],
    //         returns: []
    //     };

    //     const result = validate(functionParsedData, natspec);
    //     expect(result).toContain({
    //         severity: 'error',
    //         message: `Natspec for ${returnedValue} is missing`,
    //     });
    // });

    // it('should reveal extra natspec for returned values', () => {
    //     const returnedValue = 'someValue';
    //     const natspec = {
    //         tags: [],
    //         params: [],
    //         returns: [
    //             {
    //                 'name': returnedValue,
    //                 'description': 'Some description'
    //             }
    //         ]
    //     };

    //     const result = validate(functionParsedData, natspec);
    //     expect(result).toContain({
    //         severity: 'error',
    //         message: `Found natspec for undefined returned value ${returnedValue}`,
    //     });
    // });

    // // TODO: In these 2 tests, we're checking just the number of elements in `params` or `returns` that have no name
    // it('should reveal missing natspec for unnamed parameters values', () => {
    //     const natspec = {
    //         tags: [],
    //         params: [],
    //         returns: []
    //     };

    //     const result = validate(functionParsedData, natspec);
    //     expect(result).toContain({
    //         severity: 'error',
    //         message: `Natspec for a parameter is missing`,
    //     }));
    // });

    // it('should reveal missing natspec for unnamed returned values', () => {
    //     const returnedValue = '';
    //     const natspec = {
    //         tags: [],
    //         params: [],
    //         returns: []
    //     };

    //     const result = validate(functionParsedData, natspec);
    //     expect(result).toContain({
    //         severity: 'error',
    //         message: `Natspec for a returned value is missing`,
    //     }));
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
