import { processSources } from '../src/processor';
import { getFileCompiledSource } from '../src/utils';
import { Config } from '../src/utils';

describe('processSources', () => {
    const config: Config = {
        root: '.',
        contracts: './sample-data',
        enforceInheritdoc: false,
        constructorNatspec: false,
        ignore: []
    };

    describe('LibrarySample.sol', () => {
        it('should return warnings only for the library method empty natspec', async () => {
            const source = await getFileCompiledSource('sample-data/LibrarySample.sol');
            const warnings = await processSources([source], config);
            expect(warnings).toEqual([
                {
                    location: "sample-data/LibrarySample.sol:5\nStringUtils:nothing",
                    messages: ['Natspec is missing']
                },
            ]);
        });
    });
});
