import yargs from 'yargs';
import fs from 'fs';
import { hideBin } from 'yargs/helpers';
import _ from 'lodash';
import { defaultConfig } from '../constants';
import { configSchema } from './schemas';
import { Config } from '../types';

/**
 * Gets the config from the CLI or the config file
 * Prioritizes the config file over the CLI
 * @param {string} configPath - The expected config path
 * @returns {Config} - The config
 */
export function getConfig(configPath: string): Config {
  const argConfig = getArgsConfig();
  const fileConfig = getFileConfig(configPath);
  // Merge default config with file config and arg config
  const inputConfig = _.merge(_.merge(_.cloneDeep(defaultConfig), fileConfig), argConfig);

  return configSchema.validateSync(inputConfig);
}

/**
 * Retrieves the configuration from a file.
 * If the file does not exist or is invalid, an empty object is returned.
 * @param {string} configPath - The path to the configuration file.
 * @returns {Partial<Config>} - The configuration object parsed from the file, or an empty object if the file is invalid or does not exist.
 * @throws {Error} - If the config file is invalid.
 */
export function getFileConfig(configPath: string): Partial<Config> {
  try {
    if (!fs.existsSync(configPath)) {
      return {};
    }
    const fileContent = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(fileContent) as Partial<Config>;
  } catch (e) {
    throw Error(`Invalid config file: ${e}`);
  }
}

/**
 * Retrieves the configuration from the command-line arguments.
 * Parses the command-line arguments using yargs and returns a partial configuration object.
 * @returns {Partial<Config>} - The configuration object parsed from the command-line arguments.
 */
export function getArgsConfig(): Partial<Config> {
  const argv = yargs(hideBin(process.argv))
    .options({
      include: {
        type: 'string',
        description: 'Glob pattern of files to process.',
      },
      exclude: {
        type: 'string',
        description: 'Glob pattern of files to exclude.',
      },
      root: {
        type: 'string',
        description: 'Root directory of the project.',
      },
      inheritdoc: {
        type: 'boolean',
        description: 'If set to true, all external and public functions must have @inheritdoc.',
      },
      constructorNatspec: {
        type: 'boolean',
        description: 'If set to true, all contracts must have a natspec for the constructor.',
      },
    })
    .parseSync();

  const { $0, _, ...config } = argv;

  // Remove kebab case items from config
  Object.keys(config).forEach((key) => {
    if (key.includes('-')) {
      delete config[key];
    }
  });

  return config;
}
