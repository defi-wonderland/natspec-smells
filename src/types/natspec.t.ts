export interface NatspecTag {
    name: string;
    description: string;
}

export interface NatspecParam {
    name: string;
    description: string;
}

export interface NatspecReturn {
    name: string | undefined;
    description: string;
}

export interface Natspec {
    tags: NatspecTag[];
    params: NatspecParam[];
    returns: NatspecReturn[];
}

