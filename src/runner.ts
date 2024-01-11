import fs from 'fs/promises';
import path from 'path';
import { globSync } from 'fast-glob';
import { Config } from './types/config.t';
import { Processor } from './processor';
import { ASTKind, ASTReader, SourceUnit, compileSol } from 'solc-typed-ast';

export class Runner {
  config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async run() {
    let sourceUnits = await this.getProjectCompiledSources(this.config.root, this.config.contracts, this.ignoredPaths());
    if (!sourceUnits.length) return console.error('No solidity files found in the specified directory');

    const processor = new Processor(this.config);
    const warnings = processor.processSources(sourceUnits);

    warnings.forEach(({ location, messages }) => {
      console.warn(location);
      messages.forEach((message) => {
        console.warn(`  ${message}`);
      });
      console.warn();
    });
  }

  ignoredPaths(): string[] {
    return this.config.ignore.map((path: string) => globSync(path, { cwd: this.config.root })).flat();
  }

  async getProjectCompiledSources(rootPath: string, contractsPath: string, ignoredPaths: string[]): Promise<SourceUnit[]> {
    // Fetch Solidity files from the specified directory
    const solidityFiles: string[] = await this.getSolidityFiles(contractsPath);
    const remappings: string[] = await this.getRemappings(rootPath);

    const compiledFiles = await compileSol(solidityFiles, 'auto', {
      basePath: rootPath,
      remapping: remappings,
      includePath: [rootPath],
    });

    return (
      new ASTReader()
        .read(compiledFiles.data, ASTKind.Any, compiledFiles.files)
        // avoid processing files that are not in the specified directory, e.g. node modules or other imported files
        .filter((sourceUnit) => this.isFileInDirectory(contractsPath, sourceUnit.absolutePath))
        // avoid processing files from ignored directories
        .filter((sourceUnit) => !ignoredPaths.some((ignoredPath) => ignoredPath === sourceUnit.absolutePath))
    );
  }

  isFileInDirectory(directory: string, filePath: string): boolean {
    // Convert both paths to absolute and normalize them
    const absoluteDirectoryPath = path.resolve(directory) + path.sep;
    const absoluteFilePath = path.resolve(filePath);

    // Check if the file path starts with the directory path
    return absoluteFilePath.startsWith(absoluteDirectoryPath);
  }

  async getSolidityFiles(dir: string): Promise<string[]> {
    let files = await fs.readdir(dir, { withFileTypes: true });
    let solidityFiles: string[] = [];

    for (const file of files) {
      const res = path.resolve(dir, file.name);
      if (file.isDirectory()) {
        solidityFiles = solidityFiles.concat(await this.getSolidityFiles(res));
      } else if (file.isFile() && file.name.endsWith('.sol')) {
        solidityFiles.push(res);
      }
    }

    return solidityFiles;
  }

  async getRemappings(rootPath: string): Promise<string[]> {
    try {
      const filePath = path.join(rootPath, 'remappings.txt');
      const fileContent = await fs.readFile(filePath, 'utf8');

      return fileContent
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length)
        .map((line) => (line.slice(-1) === '/' ? line : line + '/'));
    } catch (e) {
      return [];
    }
  }
}
