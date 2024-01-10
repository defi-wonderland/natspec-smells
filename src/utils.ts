import fs from 'fs/promises';
import path from 'path';
import { ASTKind, ASTReader, SourceUnit, compileSol } from 'solc-typed-ast';

export async function getSolidityFiles(dir: string): Promise<string[]> {
    let files = await fs.readdir(dir, { withFileTypes: true });
    let solidityFiles: string[] = [];

    for (const file of files) {
        const res = path.resolve(dir, file.name);
        if (file.isDirectory()) {
            solidityFiles = solidityFiles.concat(await getSolidityFiles(res));
        } else if (file.isFile() && file.name.endsWith('.sol')) {
            solidityFiles.push(res);
        }
    }

    return solidityFiles;
}

export async function getRemappings(rootPath: string): Promise<string[]> {
    try {

        const filePath = path.join(rootPath, 'remappings.txt');
        const fileContent = await fs.readFile(filePath, 'utf8');

        return fileContent
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length)
            .map(line => line.slice(-1) === '/' ? line : line + '/');
    } catch (e) {
        return [];
    }
}

export async function getProjectCompiledSources(rootPath: string, contractsPath: string): Promise<SourceUnit[]> {
    // Fetch Solidity files from the specified directory
    const solidityFiles: string[] = await getSolidityFiles(contractsPath);
    const remappings: string[] = await getRemappings(rootPath);

    const compiledFiles = await compileSol(solidityFiles, 'auto', {
        basePath: rootPath,
        remapping: remappings,
        includePath: [rootPath],
    });
    
    return new ASTReader()
        .read(compiledFiles.data, ASTKind.Any, compiledFiles.files)
        // avoid processing files that are not in the specified directory, e.g. node modules or other imported files
        .filter(sourceUnit => sourceUnit.absolutePath.startsWith(contractsPath));
}


export async function getFileCompiledSource(filePath: string): Promise<SourceUnit> {
    const compiledFile = await compileSol(filePath, 'auto');
    return new ASTReader()
        .read(compiledFile.data, ASTKind.Any, compiledFile.files)[0]
};
