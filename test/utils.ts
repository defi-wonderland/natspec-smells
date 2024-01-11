import { ASTKind, ASTReader, SourceUnit, compileSol } from 'solc-typed-ast';
import { Natspec, NatspecDefinition } from '../src/types/natspec.t';

export interface MockNatspec {
  tags?: NatspecDefinition[];
  params?: NatspecDefinition[];
  returns?: NatspecDefinition[];
  inheritdoc?: NatspecDefinition;
}

export async function getFileCompiledSource(filePath: string): Promise<SourceUnit> {
  const compiledFile = await compileSol(filePath, 'auto');
  return new ASTReader().read(compiledFile.data, ASTKind.Any, compiledFile.files)[0];
}

export function mockNatspec(mockNatspec: MockNatspec): Natspec {
  const natspec: Natspec = {
    tags: mockNatspec.tags || [],
    params: mockNatspec.params || [],
    returns: mockNatspec.returns || [],
  };

  if (mockNatspec.inheritdoc) natspec.inheritdoc = mockNatspec.inheritdoc;

  return natspec;
}
