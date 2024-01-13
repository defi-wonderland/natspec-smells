export interface Config {
  include: string; // Required: Glob pattern of files to process.
  exclude: string[]; // Optional: Glob patterns of files to exclude.
  root: string; // Optional: Project root directory.
  enforceInheritdoc: boolean; // Optional: True if all external and public functions should have @inheritdoc.
  constructorNatspec: boolean; // Optional: True if the constructor should have natspec.
}
