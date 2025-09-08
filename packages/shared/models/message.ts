export class Message {
    type: MessageType

    constructor(type: MessageType) {
        this.type = type
    }
}

export enum MessageType {
    'update'
}