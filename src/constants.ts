import { Functions } from './types';

export const defaultFunctions: Functions = {
  internal: { tags: { dev: false, notice: true, return: true, param: true } },
  external: { tags: { dev: false, notice: true, return: true, param: true } },
  public: { tags: { dev: false, notice: true, return: true, param: true } },
  private: { tags: { dev: false, notice: true, return: true, param: true } },
  constructor: false as unknown as Function & boolean,
} as const;
