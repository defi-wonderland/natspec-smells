import {
  EnumDefinition,
  ErrorDefinition,
  EventDefinition,
  FunctionDefinition,
  ModifierDefinition,
  StructDefinition,
  VariableDeclaration,
} from 'solc-typed-ast';
import { Static, Type } from '@sinclair/typebox';

// NOTE: For params like `return` if its set to true we will only force it if the function does return something
export const functionConfigSchema = Type.Object({
  internal: Type.Optional(
    Type.Object({
      tags: Type.Object({
        dev: Type.Boolean({ default: false }),
        notice: Type.Boolean({ default: true }),
        return: Type.Boolean({ default: true }),
        param: Type.Boolean({ default: true }),
      }),
    })
  ),
  external: Type.Optional(
    Type.Object({
      tags: Type.Object({
        dev: Type.Boolean({ default: false }),
        notice: Type.Boolean({ default: true }),
        return: Type.Boolean({ default: true }),
        param: Type.Boolean({ default: true }),
      }),
    })
  ),
  public: Type.Optional(
    Type.Object({
      tags: Type.Object({
        dev: Type.Boolean({ default: false }),
        notice: Type.Boolean({ default: true }),
        return: Type.Boolean({ default: true }),
        param: Type.Boolean({ default: true }),
      }),
    })
  ),
  private: Type.Optional(
    Type.Object({
      tags: Type.Object({
        dev: Type.Boolean({ default: false }),
        notice: Type.Boolean({ default: true }),
        return: Type.Boolean({ default: true }),
        param: Type.Boolean({ default: true }),
      }),
    })
  ),
  constructor: Type.Boolean({ default: false }),
});

export const configSchema = Type.Object({
  include: Type.String(),
  exclude: Type.String({ default: '' }),
  root: Type.String({ default: './' }),
  functions: functionConfigSchema,
  inheritdoc: Type.Boolean({ default: true }),
});

export type Config = Static<typeof configSchema>;
export type Functions = Static<typeof functionConfigSchema>;

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
