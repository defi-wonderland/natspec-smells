import { object, string, boolean, date, InferType } from 'yup';
import { isDynamicPattern } from 'fast-glob';

export const tagSchema = object({
  tags: object({
    dev: boolean().default(false),
    notice: boolean().default(true),
    param: boolean().default(true),
  }),
});

export const functionSchema = object({
  tags: object({
    dev: boolean().default(false),
    notice: boolean().default(true),
    param: boolean().default(true),
    return: boolean().default(true),
  }),
});

export const functionConfigSchema = object({
  internal: functionSchema,
  external: functionSchema,
  public: functionSchema,
  private: functionSchema,
});

export const configSchema = object({
  include: string().strict().required(),
  exclude: string().strict().default(''),
  root: string().strict().default('./'),
  functions: functionConfigSchema,
  events: tagSchema,
  errors: tagSchema,
  modifiers: tagSchema,
  structs: tagSchema,
  inheritdoc: boolean().default(true),
  constructorNatspec: boolean().default(false),
});
