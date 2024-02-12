import { SourceUnit, ContractDefinition, FunctionDefinition } from 'solc-typed-ast';
import { Natspec, NodeToProcess, Config } from '../../src/types';

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

export function mockConfig(mockConfig: Partial<Config>): Config {
  return mockConfig as Config;
}

export function mockFoundryConfig(remappings: string[]): string {
  return `
    [profile.default]
    src = 'src'
    out = 'foundry-artifacts'
    test = 'test'
    path_pattern = '*.t.sol'
    libs = ["lib"]
    remappings = [${remappings.join(',\n')}]
    allow_paths = ["../node_modules"]
    cache_path = 'foundry-cache'
    optimizer_runs = 1000000
    fs_permissions = [{ access = "read-write", path = "./"}]
  `;
}
