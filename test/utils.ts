import { ASTKind, ASTReader, SourceUnit, compileSol } from 'solc-typed-ast';

export async function getFileCompiledSource(filePath: string): Promise<SourceUnit> {
  const compiledFile = await compileSol(filePath, 'auto');
  return new ASTReader().read(compiledFile.data, ASTKind.Any, compiledFile.files)[0];
}

export function expectMissingTags(warnings: string[], tag: string, numberOfWarnings: number) {
  expect(warnings.filter((warning) => warning.match(tag)).length).toBe(numberOfWarnings);
}
