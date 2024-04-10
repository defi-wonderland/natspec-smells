import { Config } from './types';

export const defaultConfig: Readonly<Config> = {
  include: './**/*.sol',
  exclude: undefined,
  root: './',
  functions: {
    internal: { tags: { dev: false, notice: true, return: true, param: true } },
    external: { tags: { dev: false, notice: true, return: true, param: true } },
    public: { tags: { dev: false, notice: true, return: true, param: true } },
    private: { tags: { dev: false, notice: true, return: true, param: true } },
  },
  modifiers: {
    tags: {
      dev: false,
      notice: true,
      param: true,
    },
  },
  structs: {
    tags: {
      dev: false,
      notice: true,
      param: true,
    },
  },
  events: {
    tags: {
      dev: false,
      notice: true,
      param: true,
    },
  },
  errors: {
    tags: {
      dev: false,
      notice: true,
      param: true,
    },
  },
  inheritdoc: true,
  constructorNatspec: false,
} as const;
