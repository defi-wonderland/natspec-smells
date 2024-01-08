import { CompileResult, compileSol } from "solc-typed-ast";

export async function parseSolidityFile(filePath: string): Promise<CompileResult> {
    return await compileSol(filePath, 'auto');
};
