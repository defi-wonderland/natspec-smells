export interface NatspecDefinition {
    name?: string;
    content: string;
}

export interface Natspec {
    inheritdoc?: NatspecDefinition;
    tags: NatspecDefinition[];
    params: NatspecDefinition[];
    returns: NatspecDefinition[];
}
