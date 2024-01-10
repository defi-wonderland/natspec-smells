import fs from 'fs/promises';
import path from 'path';

export interface Config {
    base: string;
    contracts: string
}

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