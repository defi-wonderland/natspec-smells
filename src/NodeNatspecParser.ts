import { Natspec, NatspecDefinition, NodeToProcess } from './types';

export class NodeNatspecParser {
  /**
   * Parses the natspec of the node
   * @param {NodeToProcess} node - The node to process
   * @returns {Natspec} - The parsed natspec
   */
  parse(node: NodeToProcess): Natspec {
    if (!node.documentation) {
      return { tags: [], params: [], returns: [] };
    }

    let currentTag: NatspecDefinition | null = null;
    const result: Natspec = {
      tags: [],
      params: [],
      returns: [],
    };

    const docText: string = typeof node.documentation === 'string' ? node.documentation : node.documentation.text;

    docText.split('\n').forEach((line) => {
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
          const tagMatch = line.match(/^\s*@(\w+) *(\w*) *(.*)$/);
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
  }
}
