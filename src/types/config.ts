import { InferType } from 'yup';
import { tagSchema, functionSchema, functionConfigSchema, configSchema } from '../config';

export type FunctionConfig = InferType<typeof functionSchema>;
export type Config = InferType<typeof configSchema>;
export type Functions = InferType<typeof functionConfigSchema>;
export type Tags = InferType<typeof tagSchema>;
