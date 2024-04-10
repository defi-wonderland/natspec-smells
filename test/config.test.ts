import * as path from 'path';
import fs from 'fs';
import fstest from 'fs';
import _ from 'lodash';
import { getConfig, getFileConfig, getArgsConfig } from '../src/config';
import { defaultConfig } from '../src/constants';

describe('Config', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.argv = [];
  });
  describe('getConfig', () => {
    it('should use a valid config', async () => {
      const testFile = { include: './contracts/**/*.sol' };
      fs.readFileSync = jest.fn().mockReturnValue(JSON.stringify(testFile));
      fs.existsSync = jest.fn().mockReturnValue(true);
      const config = getConfig(path.join(__dirname, './valid.config.json'));

      // The default settings should be applied
      expect(config).toEqual(_.merge(defaultConfig, testFile));
    });

    it('should revert with a validation error for exclude', async () => {
      const include = './contracts/**/*.sol';
      const exclude = 123;
      fs.readFileSync = jest.fn().mockReturnValue(
        JSON.stringify({
          include,
          exclude,
        })
      );

      fs.existsSync = jest.fn().mockReturnValue(true);
      expect(() => getConfig(path.join(__dirname, './invalid.config.json'))).toThrow(
        'exclude must be a `string` type, but the final value was: `123`.'
      );
    });

    it('should revert with a validation error for include', async () => {
      const include = 123;
      const exclude = './contracts/**/*.sol';
      fs.readFileSync = jest.fn().mockReturnValue(
        JSON.stringify({
          include,
          exclude,
        })
      );
      fs.existsSync = jest.fn().mockReturnValue(true);
      expect(() => getConfig(path.join(__dirname, './invalid.config.json'))).toThrow(
        'include must be a `string` type, but the final value was: `123`.'
      );
    });
    it('should overwrite defaults if values are set', async () => {
      const testFile = {
        include: './contracts/**/*.sol',
        exclude: './contracts/ignored.sol',
        root: './contracts',
        inheritdoc: false,
      };

      fs.readFileSync = jest.fn().mockReturnValue(
        JSON.stringify({
          ...testFile,
        })
      );
      fs.existsSync = jest.fn().mockReturnValue(true);

      const config = getConfig(path.join(__dirname, './valid.config.json'));

      expect(config).toEqual(_.merge(defaultConfig, testFile));
    });

    it('should set custom parameters for functions', async () => {
      const testFile = {
        include: './contracts/**/*.sol',
        functions: {
          internal: {
            tags: {
              dev: true,
              notice: true,
              return: true,
              param: true,
            },
          },
        },
        constructorNatspec: true,
      };
      fs.readFileSync = jest.fn().mockReturnValue(JSON.stringify({ ...testFile }));
      fs.existsSync = jest.fn().mockReturnValue(true);

      const config = getConfig(path.join(__dirname, 'asd'));

      expect(config).toEqual(_.merge(defaultConfig, testFile));
    });

    it('should override with cli args params', () => {
      process.argv = ['node', 'test.js', '--include', './solidity/**/*.sol'];
      const testFile = {
        include: './contracts/**/*.sol',
        exclude: './contracts/ignored.sol',
        root: './contracts',
        inheritdoc: false,
      };
      fs.readFileSync = jest.fn().mockReturnValue(JSON.stringify({ ...testFile }));
      fs.existsSync = jest.fn().mockReturnValue(true);
      const config = getConfig(path.join(__dirname, './valid.config.json'));
      expect(config).toEqual(_.merge(_.merge(defaultConfig, testFile), { include: './solidity/**/*.sol' }));
    });
  });
  describe('getFileConfig', () => {
    it('should return an empty object if the config file does not exist', () => {
      const configPath = '/path/to/nonexistent/config.json';
      const result = getFileConfig(configPath);
      expect(result).toEqual({});
    });
    it('should throw if the config file is invalid', () => {
      fs.readFileSync = jest.fn().mockReturnValue(
        `{
          include"": './contracts/**/*.sol',
        }`
      );
      fs.existsSync = jest.fn().mockReturnValue(true);
      expect(() => getFileConfig(path.join(__dirname, './valid.config.json'))).toThrow('Invalid config file');
    });
    it('should return the parsed configuration object if the config file is valid', () => {
      const expectedConfig = {
        include: './contracts/**/*.sol',
        exclude: './contracts/ignored.sol',
        root: './contracts',
        inheritdoc: false,
      };
      fs.readFileSync = jest.fn().mockReturnValue(JSON.stringify(expectedConfig));
      fs.existsSync = jest.fn().mockReturnValue(true);
      const configPath = '/path/to/valid/config.json';

      const result = getFileConfig(configPath);
      expect(result).toEqual(expectedConfig);
    });
  });

  describe('getArgsConfig', () => {
    it('should return an empty object if no command-line arguments are provided', () => {
      const result = getArgsConfig();
      expect(result).toEqual({});
    });

    it('should return the parsed configuration object from command-line arguments', () => {
      process.argv = [
        'node',
        'test.js',
        '--include',
        './contracts/**/*.sol',
        '--exclude',
        './contracts/ignored.sol',
        '--root',
        './contracts',
        '--inheritdoc',
        '--constructorNatspec',
      ];

      const result = getArgsConfig();
      expect(result).toEqual({
        include: './contracts/**/*.sol',
        exclude: './contracts/ignored.sol',
        root: './contracts',
        inheritdoc: true,
        constructorNatspec: true,
      });
    });
  });
});
