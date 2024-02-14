import { FunctionDefinition, FunctionKind } from 'solc-typed-ast';
import * as utils from '../src/utils';
import { mockFoundryConfig, mockFunctionDefinition } from './utils/mocks';
import fs from 'fs/promises';

import path from 'path';

describe('Utils', () => {
  describe('getSolidityFilesAbsolutePaths', () => {
    it('should return correct absolute paths', async () => {
      const relativePaths = ['test/contracts/ERC20.sol', 'test/contracts/ERC721.sol', 'test/wrong-file.txt'];
      const absolutePaths = await utils.getSolidityFilesAbsolutePaths(relativePaths);
      const expectedOutput = [path.resolve('test/contracts/ERC20.sol'), path.resolve('test/contracts/ERC721.sol')];
      expect(absolutePaths).toEqual(expectedOutput);
    });
  });
  describe('getProjectCompiledSources', () => {
    it('should return correct project compiled sources', async () => {
      const rootPath = './';
      const includedPaths = ['test/contracts/BasicSample.sol', 'test/contracts/InterfacedSample.sol'];
      const compiledSources = await utils.getProjectCompiledSources(rootPath, includedPaths);
      expect(compiledSources.length).toBe(2);
    });
  });
  describe('isFileInDirectory', () => {
    it('should return correct result', async () => {
      const directory = 'someDirectory';
      const filePath = 'someDirectory/someFile.sol';
      const result = utils.isFileInDirectory(directory, filePath);
      expect(result).toBe(true);
    });
    it('should work with deep enclosure', async () => {
      const directory = 'someDirectory';
      const filePath = 'someDirectory/subDirectory/someFile.sol';
      const result = utils.isFileInDirectory(directory, filePath);
      expect(result).toBe(true);
    });
  });
  describe('getRemappings', () => {
    it('should return correct remappings from file', async () => {
      const mockRemappingsList = ['test/contracts/=contracts/', 'contract/contracts/=contracts/'];
      fs.readFile = jest.fn().mockResolvedValueOnce(mockRemappingsList.join('\n'));
      const remappings = await utils.getRemappingsFromFile('');
      expect(remappings).toEqual(mockRemappingsList);
    });

    it('should return correct remappings from config', async () => {
      const mockRemappingsList = [
        '\n\n',
        '@0x/contracts-utils/=../node_modules/@0x/contracts-utils/',
        '\n\n\n',
        '       @0x/c!@#%@$^#ghj45h7    /=121%Y&EVBH%^43text',
        '\n\n     ',
        '\n3215135&Q!~8763!!=/wet24hwevv//test',
      ];
      const expectedOutput = [
        '@0x/contracts-utils/=../node_modules/@0x/contracts-utils/',
        '@0x/c!@#%@$^#ghj45h7    /=121%Y&EVBH%^43text',
        '3215135&Q!~8763!!=/wet24hwevv//test',
      ];

      const mockConfig = mockFoundryConfig(mockRemappingsList);
      fs.readFile = jest.fn().mockResolvedValueOnce(mockConfig);

      const remappings = await utils.getRemappingsFromConfig('');
      expect(remappings).toEqual(expectedOutput);
    });

    it('should return correct remappings from config with one-liner', async () => {
      const mockRemappingsList = ['"ds-test/=node_modules/ds-test/src", "forge-std/=node_modules/forge-std/src"'];
      const expectedOutput = ['ds-test/=node_modules/ds-test/src', 'forge-std/=node_modules/forge-std/src'];

      const mockConfig = mockFoundryConfig(mockRemappingsList);
      fs.readFile = jest.fn().mockResolvedValueOnce(mockConfig);

      const remappings = await utils.getRemappingsFromConfig('');
      expect(remappings).toEqual(expectedOutput);
    });

    it('should return right remappings from file first', async () => {
      const spy = jest.spyOn(utils, 'getRemappingsFromFile');
      spy.mockResolvedValueOnce(['file']);

      const output = await utils.getRemappings('');
      expect(output).toEqual(['file']);
    });

    it('should return remappings from config if fails', async () => {
      const spyGetRemappingsFromFile = jest.spyOn(utils, 'getRemappingsFromFile');
      spyGetRemappingsFromFile.mockRejectedValueOnce(new Error());

      const spy = jest.spyOn(utils, 'getRemappingsFromConfig');
      spy.mockResolvedValueOnce(['config']);

      const output = await utils.getRemappings('');
      expect(output).toEqual(['config']);
    });

    it('should return empty array if all fails', async () => {
      const output = await utils.getRemappings('wrong/path');
      expect(output).toEqual([]);
    });
  });

  describe('getLineNumberFromSrc', () => {
    it('should return correct line number', async () => {
      const mockFileContent = '0\n1\n2\n3\n';
      const lineNumber = utils.getLineNumberFromSrc(mockFileContent, '5:mock:123'); // 5th symbol
      expect(lineNumber).toEqual(3);
    });
  });

  describe('matchesFunctionKind', () => {
    it('should return correct function kind', async () => {
      const mockNode = mockFunctionDefinition({ kind: FunctionKind.Constructor });
      expect(utils.matchesFunctionKind(mockNode, 'constructor')).toBe(true);
    });
  });

  describe('getElementFrequency', () => {
    it('should return correct frequency', async () => {
      const example = [1, 1, 2, 2, 2, 'a', 'a', 'a', 'a'];
      const output = utils.getElementFrequency(example);
      expect(output).toEqual({
        1: 2,
        2: 3,
        a: 4,
      });
    });
  });
});
