import { processSources } from '../src/processor';
import { getFileCompiledSource } from '../src/utils';

describe('processSources', () => {
    describe('LibrarySample.sol', () => {
        it('should return warnings only for the library method empty natspec', async () => {
            const source = await getFileCompiledSource('sample-data/LibrarySample.sol');
            const warnings = await processSources([source]);
            expect(warnings).toEqual([
                {
                    location: "sample-data/LibrarySample.sol:5\nStringUtils:nothing",
                    messages: ['Natspec is missing']
                },
            ]);
        });
    });
});
