import { SourceUnit, ContractDefinition, FunctionDefinition } from 'solc-typed-ast';
import { Natspec, NodeToProcess } from '../src/types';

export function mockNatspec(mockNatspec: Partial<Natspec>): Natspec {
  const natspec: Natspec = {
    tags: mockNatspec.tags || [],
    params: mockNatspec.params || [],
    returns: mockNatspec.returns || [],
  };

  if (mockNatspec.inheritdoc) natspec.inheritdoc = mockNatspec.inheritdoc;

  return natspec;
}

export function mockNodeToProcess(mockNodeToProcess: Partial<NodeToProcess>): NodeToProcess {
  return mockNodeToProcess as NodeToProcess;
}

export function mockFunctionDefinition(mockFunctionDefinition: Partial<FunctionDefinition>): FunctionDefinition {
  // This is a hack to trick `instanceof`
  let functionDefinition: FunctionDefinition = Object.create(FunctionDefinition.prototype);
  Object.assign(functionDefinition, mockFunctionDefinition);
  return functionDefinition;
}

export function mockSourceUnit(mockSourceUnit: Partial<SourceUnit>): SourceUnit {
  return mockSourceUnit as SourceUnit;
}

export function mockContractDefinition(mockContractDefinition: Partial<ContractDefinition>): ContractDefinition {
  return mockContractDefinition as ContractDefinition;
}
