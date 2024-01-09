import { processSources } from '../src/processor';
import { parseSolidityFile } from './test-utils';

describe('processSources', () => {

    describe('LibrarySample.sol', () => {

        it('should return warnings only for the library method empty natspec', async () => {
            const sources = (await parseSolidityFile('sample-data/LibrarySample.sol')).data.sources;
            const warnings = await processSources(sources);
            expect(warnings).toEqual([
                {
                    location: 'sample-data/LibrarySample.sol:StringUtils:nothing',
                    messages: ['Natspec is missing']
                },
            ]);
        });
    });
});
