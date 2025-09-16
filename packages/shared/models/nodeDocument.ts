import config from "../config.json";
import type { EndpointData, Node } from "./node";
import { newID } from "./util";

export enum NodeDocumentType {
  "component",
  "entrypoint",
}

// TODO split node document in file model and runtime model
// and implement parsing & serializing methods

export interface ComponentDocumentProperties {
  slotsData: EndpointData[];
  emittersData: EndpointData[];
};

export interface EntrypointDocumentProperties {
  entrypointData: EndpointData;
};

export interface NodeDocument {
  verison: string;
  id: string;
  type: NodeDocumentType;
  properties: any;
  nodes: { [id:string]: Node };
};

export function CreateEmptyNodeDocument(type: NodeDocumentType): NodeDocument {
  let properties = {}
  switch (type) {
    case NodeDocumentType.component:
      properties = {
        emittersData: [],
        slotsData: [],
      } as ComponentDocumentProperties
      break;
    case NodeDocumentType.entrypoint:
      properties = {
        entrypointData: {
          name: "main"
        }
      } as EntrypointDocumentProperties;
      break;
  }

  return {
    id: newID(),
    type: type,
    verison: config.nodeFlowVersion,
    properties: properties,
    nodes: {},
  }
}

export type NodeInstance = { id: string } & Node
export type EndpointRefernce = { nodeId: string, name: string }

export function getNodeInstances(doc: NodeDocument): NodeInstance[] {
  return Object.entries(doc.nodes).map(p => ({ id: p[0], ...p[1] }));
}

export function addNodeToDocument(doc: NodeDocument, node: Node): NodeInstance {
  const id = newID();
  doc.nodes[id] = node;
  return { id, ...node };
}

export function connectSlotAndEmitter(doc: NodeDocument, slot: EndpointRefernce, emitter: EndpointRefernce) {
  const node = doc.nodes[slot.nodeId];
  if(!node) {
    return;
  }
  node.slotConnections[slot.name] = emitter
}
