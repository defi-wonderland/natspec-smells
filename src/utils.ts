import fs from 'fs/promises';
import path from 'path';
import { Natspec, NatspecDefinition, NodeToProcess } from './types';
import { ASTKind, ASTReader, SourceUnit, compileSol, FunctionDefinition } from 'solc-typed-ast';

/**
 * Returns the absolute paths of the Solidity files
 * @param {string[]} files - The list of files paths
 * @returns {Promise<string[]>} - The list of absolute paths
 */
export async function getSolidityFilesAbsolutePaths(files: string[]): Promise<string[]> {
  return files.filter((file) => file.endsWith('.sol')).map((file) => path.resolve(file));
}

/**
 * Returns the list of source units of the compiled Solidity files
 * @param {string} rootPath - The root path of the project
 * @param {string[]} includedPaths - The list of included paths
 * @returns {SourceUnit[]} - The list of source units extracted from the compiled files
 */
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

/**
 * Checks if the file path is in the specified directory
 * @param {string} directory - The directory path
 * @param {string} filePath - The file path
 * @returns {boolean} - True if the file is in the directory
 */
export function isFileInDirectory(directory: string, filePath: string): boolean {
  // Convert both paths to absolute and normalize them
  const absoluteDirectoryPath = path.resolve(directory) + path.sep;
  const absoluteFilePath = path.resolve(filePath);

  // Check if the file path starts with the directory path
  return absoluteFilePath.startsWith(absoluteDirectoryPath);
}

/**
 * Returns the remappings from the remappings.txt file or foundry.toml
 * @param {string} rootPath - The root path of the project
 * @returns {Promise<string[]>} - The list of remappings
 */
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

/**
 * Returns the remappings from the remappings.txt file
 * @param {string} remappingsPath - The path of the remappings file
 * @returns {Promise<string[]>} - The list of remappings
 */
export async function getRemappingsFromFile(remappingsPath: string): Promise<string[]> {
  const remappingsContent = await fs.readFile(remappingsPath, 'utf8');

  return remappingsContent
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length)
    .map((line) => sanitizeRemapping(line));
}

/**
 * Returns the remappings from the foundry.toml file
 * @param {string} foundryConfigPath - The path of the foundry.toml file
 * @returns {Promise<string[]>} - The list of remappings
 */
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
      .map((line) => sanitizeRemapping(line));
  } else {
    return [];
  }
}

/**
 * Makes sure both sides of a remapping either have or don't have a trailing slash
 * @param {string} line - A line from the remappings array
 * @returns {string} - The sanitized line
 */
export function sanitizeRemapping(line: string): string {
  const [key, value] = line.split('=');
  const slashNeeded = key.endsWith('/');

  if (slashNeeded) {
    return value.endsWith('/') ? line : `${line}/`;
  } else {
    return value.endsWith('/') ? line.slice(0, -1) : line;
  }
}

/**
 * Parses the natspec of the node
 * @param {NodeToProcess} node - The node to process
 * @returns {Natspec} - The parsed natspec
 */
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

/**
 * Returns the line number from the source code
 * @param {string} fileContent - The content of the file
 * @param {string} src - The node src location (e.g. "10:1:0")
 * @returns {number} - The line number of the node
 */
export function getLineNumberFromSrc(fileContent: string, src: string): number {
  const [start] = src.split(':').map(Number);
  const lines = fileContent.substring(0, start).split('\n');
  return lines.length; // Line number
}

/**
 * Checks if the node matches the function kind
 * @param {NodeToProcess} node - The node to process
 * @param {string} kind - The function kind
 * @returns {boolean} - True if the node matches the function kind
 */
export function matchesFunctionKind(node: NodeToProcess, kind: string): boolean {
  return node instanceof FunctionDefinition && node.kind === kind;
}

/**
 * Returns the frequency of the elements in the array
 * @param {any[]} array - The array of elements
 * @returns {Record<string, number>} - The frequency of the elements
 */
export function getElementFrequency(array: any[]) {
  return array.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {});
}
