export interface Config {
  include: string; // Required: Glob pattern of files to process.
  exclude: string[]; // Optional: Glob patterns of files to exclude.
  root: string; // Optional: The target root directory.
  enforceInheritdoc: boolean; // Optional: If set to true, all external and public functions must have @inheritdoc.
  constructorNatspec: boolean; // Optional: True if constructor natspec is mandatory.
}
