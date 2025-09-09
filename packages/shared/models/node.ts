import { randomUUID, type UUID } from 'crypto';

export enum NodeTypes {
    add = '+',
    sub = '-',
    mul = '*',
    div = '/',
    split = 'split',
    merge = 'merge',
}

export interface INode {
    getId(): UUID;
    getName(): string;
    getSlots(): Slot[];
    getEmitters(): Emitter[];
}

export class Node implements INode {
    private _id: UUID = randomUUID();
    slots: Slot[] = [];
    emitters: Emitter[] = [];

    constructor(private _name: string) { }

    getId(): UUID { return this._id; }
    getName(): string { return this._name; }
    getSlots(): Slot[] { return this.slots; }
    getEmitters(): Emitter[] { return this.emitters; }

    toJSON() {
        return {
          id: this._id,
          name: this._name,
          slots: this.slots.map(x => x.toJSON()),
          emitters: this.emitters.map(x => x.toJSON()),
        } as NodeJSON;
    }
}

export interface NodeJSON {
    id: UUID,
    name: string,
    slots: SlotJSON[],
    emitters: EmitterJSON[],
}

export class Slot implements SlotJSON {
    public get name(): string { return this._name; }
    public get node(): INode {return this._node; }

    constructor(private _node: INode, private _name: string) { }

    toJSON() {
        return this as SlotJSON;
    }
}

export interface SlotJSON {
    name: string,
}

export class Emitter implements EmitterJSON {
    public get name(): string { return this._name; }
    public get node(): INode {return this._node; }

    constructor(private _node: INode, private _name: string) { }

    toJSON() {
        return this as EmitterJSON;
    }
}

export interface EmitterJSON {
    name: string,
}