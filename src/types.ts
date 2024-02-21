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
export const functionConfigSchema = Type.Optional(
  Type.Object({
    internal: Type.Optional(
      Type.Object({
        tags: Type.Object({
          dev: Type.Boolean(),
          notice: Type.Boolean(),
          return: Type.Boolean(),
        }),
        inheritdoc: Type.Optional(Type.Boolean()),
      })
    ),
    external: Type.Optional(
      Type.Object({
        tags: Type.Object({
          dev: Type.Boolean(),
          notice: Type.Boolean(),
          return: Type.Boolean(),
        }),
        inheritdoc: Type.Optional(Type.Boolean()),
      })
    ),
    public: Type.Optional(
      Type.Object({
        tags: Type.Object({
          dev: Type.Boolean(),
          notice: Type.Boolean(),
          return: Type.Boolean(),
        }),
        inheritdoc: Type.Optional(Type.Boolean()),
      })
    ),
    private: Type.Optional(
      Type.Object({
        tags: Type.Object({
          dev: Type.Boolean(),
          notice: Type.Boolean(),
          return: Type.Boolean(),
        }),
        inheritdoc: Type.Optional(Type.Boolean()),
      })
    ),
  })
);

export const configSchema = Type.Object({
  include: Type.String(),
  exclude: Type.String({ default: '' }),
  root: Type.String({ default: './' }),
  functions: functionConfigSchema,
  enforceInheritdoc: Type.Boolean({ default: true }),
  constructorNatspec: Type.Boolean({ default: false }),
});

export type Config = Static<typeof configSchema>;
export type Functions = Static<typeof functionConfigSchema>;

export interface FunctionConfig {
  tags: Tags;
  inheritdoc?: boolean; // Optional: True if @inheritdoc is mandatory for contracts, and we check the interface that is inherited for the defined `tags`
}

export interface Tags {
  dev: boolean;
  notice: boolean;
  return: boolean;
}

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
