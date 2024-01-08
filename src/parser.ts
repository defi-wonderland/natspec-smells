import { Natspec, NatspecParam, NatspecReturn, NatspecTag } from "./types/natspec.t";
import { SolcContractNode } from "./types/solc-typed-ast.t";

export function parseNodeNatspec(node: SolcContractNode): Natspec {
    if (!node.documentation || !node.documentation.text) {
        return { tags: [], params: [], returns: [] };
    }

    const docLines = node.documentation.text.split('\n');
    let currentTag: null | NatspecTag | NatspecParam | NatspecReturn = null;
    const result = {
        tags: [],
        params: [],
        returns: []
    };

    docLines.forEach(line => {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('@')) {
            const tagMatch = trimmedLine.match(/^\s*@(\w+) (.*)$/);
            if (tagMatch) {
                const tagName = tagMatch[1];
                const tagDescription = tagMatch[2].trim();

                if (tagName === 'param' || tagName === 'return') {
                    currentTag = { name: '', description: tagDescription };
                    result[tagName === 'param' ? 'params' : 'returns'].push(currentTag);
                } else {
                    currentTag = { name: tagName, description: tagDescription };
                    result.tags.push(currentTag);
                }
            }
        } else if (currentTag && trimmedLine) {
            currentTag.description += (currentTag.description ? '\n' : '') + trimmedLine;
        }
    });

    return result;
};
