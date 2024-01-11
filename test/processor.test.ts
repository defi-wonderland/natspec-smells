import { Processor } from '../src/processor';
import { getFileCompiledSource } from '../src/utils';
import { Config } from '../src/utils';

describe('processSources', () => {
  const config: Config = {
    root: '.',
    contracts: './sample-data',
    enforceInheritdoc: false,
    constructorNatspec: false,
    ignore: [],
  };

  const processor: Processor = new Processor(config);

  describe('LibrarySample.sol', () => {
    it('should return warnings only for the library method empty natspec', async () => {
      const source = await getFileCompiledSource('sample-data/LibrarySample.sol');
      const warnings = processor.processSources([source]);

      expect(warnings).toEqual([
        {
          location: 'sample-data/LibrarySample.sol\nStringUtils:nothing',
          messages: ['Natspec is missing'],
        },
      ]);
    });
  });
});
