import fs from 'fs/promises';
import path from 'path';
import { ASTKind, ASTReader, SourceUnit, compileSol, FunctionDefinition } from 'solc-typed-ast';
import { Natspec, NatspecDefinition, NodeToProcess } from './types';

export async function getSolidityFilesAbsolutePaths(files: string[]): Promise<string[]> {
  return files.filter((file) => file.endsWith('.sol')).map((file) => path.resolve(file));
}

export async function getProjectCompiledSources(rootPath: string, includedPaths: string[], excludedPaths: string[]): Promise<SourceUnit[]> {
  // Fetch Solidity files from the specified directory
  const solidityFiles: string[] = await getSolidityFilesAbsolutePaths(includedPaths);
  const remappings: string[] = await getRemappings(rootPath);

  const compiledFiles = await compileSol(solidityFiles, 'auto', {
    basePath: rootPath,
    remapping: remappings,
    includePath: [rootPath],
  });

  return (
    new ASTReader()
      .read(compiledFiles.data, ASTKind.Any, compiledFiles.files)
      // avoid processing files that are not in the specified directory, e.g. node modules or other imported files
      .filter((sourceUnit) => includedPaths.includes(sourceUnit.absolutePath))
      // avoid processing files from excluded directories
      .filter((sourceUnit) => !excludedPaths.includes(sourceUnit.absolutePath))
  );
}

export async function getFileCompiledSource(filePath: string): Promise<SourceUnit> {
  const compiledFile = await compileSol(filePath, 'auto');
  return new ASTReader().read(compiledFile.data, ASTKind.Any, compiledFile.files)[0];
}

export function isFileInDirectory(directory: string, filePath: string): boolean {
  // Convert both paths to absolute and normalize them
  const absoluteDirectoryPath = path.resolve(directory) + path.sep;
  const absoluteFilePath = path.resolve(filePath);

  // Check if the file path starts with the directory path
  return absoluteFilePath.startsWith(absoluteDirectoryPath);
}

export async function getRemappings(rootPath: string): Promise<string[]> {
  // First try the remappings.txt file
  try {
    return await getRemappingsFromFile(path.join(rootPath, 'remappings.txt'));
  } catch (e) {
    // If the remappings file does not exist, try foundry.toml
    try {
      return await getRemappingsFromConfig(path.join(rootPath, 'foundry.toml'));
    } catch {
      return [];
    }
  }
}

export async function getRemappingsFromFile(remappingsPath: string): Promise<string[]> {
  const remappingsContent = await fs.readFile(remappingsPath, 'utf8');

  return remappingsContent
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length)
    .map((line) => (line.slice(-1) === '/' ? line : line + '/'));
}

export async function getRemappingsFromConfig(foundryConfigPath: string): Promise<string[]> {
  const foundryConfigContent = await fs.readFile(foundryConfigPath, 'utf8');
  const regex = /\n+remappings[\s|\n]*\=[\s\n]*\[\n*\s*(?<remappings>[a-zA-Z-="'\/_,\n\s]+)/;
  const matches = foundryConfigContent.match(regex);
  if (matches) {
    return matches
      .groups!.remappings.split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length)
      .map((line) => line.replace(',', ''));
  } else {
    return [];
  }
}

export function parseNodeNatspec(node: NodeToProcess): Natspec {
  if (!node.documentation) {
    return { tags: [], params: [], returns: [] };
  }

  let currentTag: NatspecDefinition | null = null;
  const result: Natspec = {
    tags: [],
    params: [],
    returns: [],
  };

  const docText: string = typeof node.documentation === 'string' ? node.documentation : node.documentation.text;

  docText.split('\n').forEach((line) => {
    const tagTypeMatch = line.match(/^\s*@(\w+)/);
    if (tagTypeMatch) {
      const tagName = tagTypeMatch[1];

      if (tagName === 'inheritdoc') {
        const tagMatch = line.match(/^\s*@(\w+) (.*)$/);
        if (tagMatch) {
          currentTag = null;
          result.inheritdoc = { content: tagMatch[2] };
        }
      } else if (tagName === 'param' || tagName === 'return') {
        const tagMatch = line.match(/^\s*@(\w+) *(\w*) *(.*)$/);
        if (tagMatch) {
          currentTag = { name: tagMatch[2], content: tagMatch[3].trim() };
          result[tagName === 'param' ? 'params' : 'returns'].push(currentTag);
        }
      } else {
        const tagMatch = line.match(/^\s*@(\w+) *(.*)$/);
        if (tagMatch) {
          currentTag = { name: tagName, content: tagMatch[2] };
          result.tags.push(currentTag);
        }
      }
    } else if (currentTag) {
      currentTag.content += '\n' + line;
    }
  });

  return result;
}

export function getLineNumberFromSrc(fileContent: string, src: string): number {
  const [start] = src.split(':').map(Number);
  const lines = fileContent.substring(0, start).split('\n');
  return lines.length; // Line number
}

export function matchesFunctionKind(node: NodeToProcess, kind: string): boolean {
  return node instanceof FunctionDefinition && node.kind === kind;
}
