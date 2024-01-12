import { InternalConfig, UserConfig } from "./types/config.t";

export async function getConfig(configPath: string): Promise<InternalConfig> {
    const configModule = await import(configPath);
    const userConfig: UserConfig = 'default' in configModule ? configModule.default : configModule;
    if (!userConfig.contracts) throw new Error('Config must specify a root directory');

    return {
        contracts: userConfig.contracts,
        root: userConfig.root || './',
        enforceInheritdoc: userConfig.enforceInheritdoc ?? true,
        constructorNatspec: userConfig.constructorNatspec ?? false,
        ignore: userConfig.ignore || []
    }
}