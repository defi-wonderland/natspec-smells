import { ASTKind, ASTReader, SourceUnit, compileSol } from 'solc-typed-ast';
import path from 'path';
import { NodeToProcess } from '../../src/types';

export async function getFileCompiledSource(filePath: string): Promise<SourceUnit> {
  const compiledFile = await compileSol(filePath, 'auto');
  return new ASTReader().read(compiledFile.data, ASTKind.Any, compiledFile.files)[0];
}

export function expectWarning(warnArray: string[], expectedWarn: string, numberOfWarnings: number) {
  expect(warnArray).toContain(expectedWarn);
  expect(warnArray.filter((x) => x == expectedWarn).length).toBe(numberOfWarnings);
}

export function findNode(nodes: readonly NodeToProcess[], name: string): any {
  return nodes.find((x) => x.name === name);
}
