interface TypeDescriptions {
    typeIdentifier: string;
    typeString: string;
}

interface TypeName {
    id: number;
    name: string;
    nodeType: string;
    src: string;
    typeDescriptions: TypeDescriptions;
}

interface VariableDeclaration {
    constant: boolean;
    id: number;
    mutability: string;
    name: string;
    nameLocation: string;
    nodeType: string;
    scope: number;
    src: string;
    stateVariable: boolean;
    storageLocation: string;
    typeDescriptions: TypeDescriptions;
    typeName: TypeName;
    visibility: string;
}

interface ParameterList {
    id: number;
    nodeType: string;
    parameters: VariableDeclaration[];
    src: string;
}

interface Literal {
    hexValue: string;
    id: number;
    isConstant: boolean;
    isLValue: boolean;
    isPure: boolean;
    kind: string;
    lValueRequested: boolean;
    nodeType: string;
    src: string;
    typeDescriptions: TypeDescriptions;
    value: string;
}

interface Expression {
    expression: Literal;
    functionReturnParameters?: number;
    id: number;
    nodeType: string;
    src: string;
}

interface Statement {
    expression: Expression;
    functionReturnParameters: number;
    id: number;
    nodeType: string;
    src: string;
}

interface Block {
    id: number;
    nodeType: string;
    src: string;
    statements: Statement[];
}

interface Documentation {
    id: number;
    nodeType: string;
    src: string;
    text: string;
}

export interface SolcContractNode {
    body?: Block;
    constant?: boolean;
    documentation: Documentation;
    functionSelector?: string;
    id: number;
    implemented?: boolean;
    kind?: string;
    modifiers?: any[];
    name: string;
    nameLocation: string;
    nodeType: string;
    parameters?: ParameterList;
    returnParameters?: ParameterList;
    scope: number;
    src: string;
    stateMutability?: string;
    virtual?: boolean;
    visibility: string;
    mutability?: string;
    stateVariable?: boolean;
    storageLocation?: string;
    typeDescriptions?: TypeDescriptions;
    typeName?: TypeName;
    value?: Literal;
}
