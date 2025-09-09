import { NodeTypes } from "./node"
import type { NodeDocument } from "./nodeDocument"

export interface Message {
    type: MessageType
}

export enum MessageType {
    'documentUpdated',
    'setNodeCreatePosition',
}

export class DocumentUpdatedReport implements Message {
    type = MessageType.documentUpdated
    
    constructor(public readonly document: NodeDocument) { }
}

export class SetNodeCreatePositionReport implements Message {
    type = MessageType.setNodeCreatePosition
    
    constructor(
        public readonly x: number, 
        public readonly y: number) { }
}