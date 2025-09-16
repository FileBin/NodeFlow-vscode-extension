import type { NodeDocument } from './nodeDocument'
import type { Point2D } from './util'

export interface Message {
  type: MessageType
}

export enum MessageType {
  documentUpdated = 0,
  setNodeCreatePosition = 1,
}

export class DocumentUpdatedReport implements Message {
  type = MessageType.documentUpdated

  constructor(public readonly document: NodeDocument) {}
}

export class SetNodeCreatePositionReport implements Message {
  type = MessageType.setNodeCreatePosition

  constructor(public readonly pos: Point2D) {}
}
