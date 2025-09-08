import { randomUUID, UUID } from 'crypto';
import config from '../config.json';


export enum NodeDocumentType {
    "component",
    "entrypoint"
}

interface INodeDocumentProperties {
    getSlots(): Slot[];
    getEmitters(): Emitter[];
}

interface INode {
    getId(): UUID;
    getName(): string;
    getSlots(): Slot[];
    getEmitters(): Emitter[];
}

export class ComponentDocumentProperties implements INodeDocumentProperties {
    getSlots(): Slot[] {
        return this.slots;
    }

    getEmitters(): Emitter[] {
        return this.emitters;
    }

    slots: Slot[] = [];
    emitters: Emitter[] = [];
}

export class EntrypointDocumentProperties implements INodeDocumentProperties {
    document: INode;

    constructor(document: INode) {
        this.document = document;
    }

    getSlots(): Slot[] {
        return [
            {
                name: this.entrypointName,
                node: this.document,
            }
        ];
    }

    getEmitters(): Emitter[] {
        return [];
    }

    entrypointName = "main";
}

export class NodeDocument implements INode {
    readonly version: string;
    readonly type: NodeDocumentType;
    readonly id: UUID;
    name: string;
    properties: INodeDocumentProperties;
    nodes: Node[] = [];
    connections: Connection[] = [];

    constructor(type: NodeDocumentType, name: string) {
        this.id = randomUUID();
        this.version = config.nodeFlowVersion;
        this.type = type;
        this.name = name;

        switch (type) {
            case NodeDocumentType.component:
                this.properties = new ComponentDocumentProperties;
                break;

            case NodeDocumentType.entrypoint:
                this.properties = new EntrypointDocumentProperties(this);
                break;
        }
    }

    getId(): UUID { return this.id; }
    getName(): string { return this.name; }
    getSlots(): Slot[] { return this.properties.getSlots(); }
    getEmitters(): Emitter[] { return this.properties.getEmitters(); }
}

export class Node implements INode {
    id: UUID = randomUUID();
    name!: string;
    slots: Slot[] = [];
    emitters: Emitter[] = [];

    getId(): UUID { return this.id; }
    getName(): string { return this.name; }
    getSlots(): Slot[] { return this.slots; }
    getEmitters(): Emitter[] { return this.emitters; }
}

export class Slot {
    node: INode;
    name: string;

    constructor(node: INode, name: string) {
        this.node = node;
        this.name = name;
    }
}

export class Emitter {
    node: INode;
    name: string;

    constructor(node: INode, name: string) {
        this.node = node;
        this.name = name;
    }
}

export class Connection {
    emitter: Emitter;
    slot: Slot;

    constructor(emitter: Emitter, slot: Slot) {
        this.emitter = emitter;
        this.slot = slot;
    }
}

