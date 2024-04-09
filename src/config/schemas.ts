import { object, string, boolean, date, InferType } from 'yup';

export const tagSchema = object({
  tags: object({
    dev: boolean().required().strict(),
    notice: boolean().required().strict(),
    param: boolean().required().strict(),
  }),
});

export const functionSchema = object({
  tags: object({
    dev: boolean().required().strict(),
    notice: boolean().required().strict(),
    param: boolean().required().strict(),
    return: boolean().required().strict(),
  }),
});

export const functionConfigSchema = object({
  internal: functionSchema,
  external: functionSchema,
  public: functionSchema,
  private: functionSchema,
});

export const configSchema = object({
  include: string().required().strict(),
  exclude: string().strict().optional(),
  root: string().required().strict(),
  functions: functionConfigSchema,
  events: tagSchema,
  errors: tagSchema,
  modifiers: tagSchema,
  structs: tagSchema,
  inheritdoc: boolean().required().strict(),
  constructorNatspec: boolean().required().strict(),
});
