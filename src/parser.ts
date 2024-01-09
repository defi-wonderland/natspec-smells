import { Natspec, NatspecDefinition } from "./types/natspec.t";
import { SolcContractNode } from "./types/solc-typed-ast.t";

export function parseNodeNatspec(node: SolcContractNode): Natspec {
    if (!node.documentation || !node.documentation.text) {
        return { tags: [], params: [], returns: [] };
    }
    
    const docLines = node.documentation.text.split('\n');

    let currentTag: NatspecDefinition | null = null;
    const result: Natspec = {
        tags: [],
        params: [],
        returns: []
    };

    docLines.forEach(line => {
        const tagTypeMatch = line.match(/^\s*@(\w+)/);
        if (tagTypeMatch) {
            const tagName = tagTypeMatch[1];
            
            if (tagName === 'inheritdoc') {
                const tagMatch = line.match(/^\s*@(\w+) (.*)$/);
                if (tagMatch) {
                    currentTag = null;
                    result.inheritdoc = { content: tagMatch[2] };
                }
            } else if (tagName === 'param' || tagName === 'return') {
                const tagMatch = line.match(/^\s*@(\w+) *(\w+) (.*)$/);
                if (tagMatch) {
                    currentTag = { name: tagMatch[2], content: tagMatch[3].trim() };
                    result[tagName === 'param' ? 'params' : 'returns'].push(currentTag);
                }
            } else {
                const tagMatch = line.match(/^\s*@(\w+) *(.*)$/);
                if (tagMatch) {
                    currentTag = { name: tagName, content: tagMatch[2] };
                    result.tags.push(currentTag);
                }
            }
        } else if (currentTag) {
            currentTag.content += '\n' + line;
        }
    });

    return result;
};
