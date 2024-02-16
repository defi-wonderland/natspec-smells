import fs from 'fs/promises';
import path from 'path';
import { Natspec, NatspecDefinition, NodeToProcess } from './types';
import { ASTKind, ASTReader, SourceUnit, compileSol, FunctionDefinition } from 'solc-typed-ast';

export async function getSolidityFilesAbsolutePaths(files: string[]): Promise<string[]> {
  return files.filter((file) => file.endsWith('.sol')).map((file) => path.resolve(file));
}

export async function getProjectCompiledSources(rootPath: string, includedPaths: string[]): Promise<SourceUnit[]> {
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
  );
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
    return await exports.getRemappingsFromFile(path.join(rootPath, 'remappings.txt'));
  } catch (e) {
    // If the remappings file does not exist, try foundry.toml
    try {
      return await exports.getRemappingsFromConfig(path.join(rootPath, 'foundry.toml'));
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
    .map((line) => fixTrailingSlash(line));
}

export async function getRemappingsFromConfig(foundryConfigPath: string): Promise<string[]> {
  const foundryConfigContent = await fs.readFile(foundryConfigPath, 'utf8');
  const regex = /remappings[\s|\n]*\=[\s\n]*\[(?<remappings>[^\]]+)]/;
  const matches = foundryConfigContent.match(regex);
  if (matches) {
    return matches
      .groups!.remappings.split(',')
      .map((line) => line.trim())
      .map((line) => line.replace(/["']/g, ''))
      .filter((line) => line.length)
      .map((line) => fixTrailingSlash(line));
  } else {
    return [];
  }
}

export function fixTrailingSlash(line: string): string {
  // Make sure the key and the value both either have or don't have a trailing slash
  const [key, value] = line.split('=');
  const slashNeeded = key.endsWith('/');

  if (slashNeeded) {
    return value.endsWith('/') ? line : `${line}/`;
  } else {
    return value.endsWith('/') ? line.slice(0, -1) : line;
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

export function getElementFrequency(array: any[]) {
  return array.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {});
}
