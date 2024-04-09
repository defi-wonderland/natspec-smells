export * from './config';
import {
  EnumDefinition,
  ErrorDefinition,
  EventDefinition,
  FunctionDefinition,
  ModifierDefinition,
  StructDefinition,
  VariableDeclaration,
} from 'solc-typed-ast';

export type KeysForSupportedTags = 'events' | 'errors' | 'modifiers' | 'structs';

export interface NatspecDefinition {
  name?: string;
  content: string;
}

export interface Natspec {
  inheritdoc?: NatspecDefinition;
  tags: NatspecDefinition[];
  params: NatspecDefinition[];
  returns: NatspecDefinition[];
}

export interface ASTNodeRawDocumentation {
  id: number;
  nodeType: string;
  src: string;
  text: string;
}

export interface ASTNodeRaw {
  name: string;
  kind: string;
  documentation?: ASTNodeRawDocumentation;
}

export type NodeToProcess =
  | FunctionDefinition
  | EnumDefinition
  | ErrorDefinition
  | EventDefinition
  | ModifierDefinition
  | VariableDeclaration
  | StructDefinition;

export interface IWarning {
  location: string;
  messages: string[];
}

export type HasVParameters = {
  vParameters: {
    vParameters: Array<{ name: string }>;
  };
};
