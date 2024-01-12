export interface UserConfig {
    contracts: string; // Required: The directory containing your Solidity contracts.
    root?: string; // Optional: The target root directory.
    enforceInheritdoc?: boolean; // Optional: If set to true, all external and public functions must have @inheritdoc.
    constructorNatspec?: boolean; // Optional: True if constructor natspec is mandatory.
    ignore?: string[]; // Optional: Glob pattern of files and directories to exclude from processing.
}

// Config type after all the default values are applied
export interface InternalConfig {
    contracts: string;
    root: string;
    enforceInheritdoc: boolean;
    constructorNatspec: boolean;
    ignore: string[];
}
