import { randomUUID, type UUID } from 'crypto';
import config from '../config.json';
import { type Emitter, Slot, type INode, type Node } from './node';

export enum NodeDocumentType {
    "component",
    "entrypoint"
}

interface INodeDocumentProperties {
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
            new Slot(this.document, this.entrypointName),
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

export class Connection {
    emitter: Emitter;
    slot: Slot;

    constructor(emitter: Emitter, slot: Slot) {
        this.emitter = emitter;
        this.slot = slot;
    }
}

