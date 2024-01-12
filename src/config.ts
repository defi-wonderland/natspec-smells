import { Config } from './types/config';

export async function getConfig(configPath: string): Promise<Config> {
  const configModule = await import(configPath);
  const config: Partial<Config> = 'default' in configModule ? configModule.default : configModule;
  if (!config.include) throw new Error('Config must specify a root directory');

  return {
    include: config.include,
    root: config.root || './',
    enforceInheritdoc: config.enforceInheritdoc ?? true,
    constructorNatspec: config.constructorNatspec ?? false,
    exclude: config.exclude || [],
  };
}
