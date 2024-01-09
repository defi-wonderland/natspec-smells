import { Natspec, NatspecParam, NatspecReturn, NatspecTag } from "./types/natspec.t";
import { SolcContractNode } from "./types/solc-typed-ast.t";

export function parseNodeNatspec(node: SolcContractNode): Natspec {
    if (!node.documentation || !node.documentation.text) {
        return { tags: [], params: [], returns: [] };
    }
    
    const docLines = node.documentation.text.split('\n');

    let currentTag: null | NatspecTag | NatspecParam | NatspecReturn = null;
    const result: Natspec = {
        tags: [],
        params: [],
        returns: []
    };

    docLines.forEach(line => {
        const tagTypeMatch = line.match(/^\s*@(\w+)/);
        if (tagTypeMatch) {
            const tagName = tagTypeMatch[1];
            
            if (tagName === 'param' || tagName === 'return') {
                const tagMatch = line.match(/^\s*@(\w+) (\w+) (.*)$/);
                if (tagMatch) {
                    currentTag = { name: tagMatch[2], description: tagMatch[3].trim() };
                    if (tagName === 'param') {
                        result.params.push(currentTag as NatspecParam);
                    } else {
                        result.returns.push(currentTag as NatspecReturn);
                    }
                }
            } else {
                const tagMatch = line.match(/^\s*@(\w+) (.*)$/);
                if (tagMatch) {
                    currentTag = { name: tagName, description: tagMatch[2] };
                    result.tags.push(currentTag as NatspecTag);
                }
            }
        } else if (currentTag) {
            currentTag.description += '\n' + line;
        }
    });

    return result;
};
