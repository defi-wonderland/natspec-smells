import { ASTKind, ASTReader, SourceUnit, compileSol } from 'solc-typed-ast';

export async function getFileCompiledSource(filePath: string): Promise<SourceUnit> {
  const compiledFile = await compileSol(filePath, 'auto');
  return new ASTReader().read(compiledFile.data, ASTKind.Any, compiledFile.files)[0];
}
