import { type Point2D } from './util'
import type { EndpointRefernce } from './nodeDocument'
import { getMathNodeEmitters, getMathNodeLabel, getMathNodeSlots, type MathNode } from './nodes/mathNode'

export enum NodeType {
  Math = 'math',
}

export interface Node {
  type: NodeType
  position: Point2D
  slotConnections: { [name: string]: EndpointRefernce }
}

export interface EndpointData {
  name: string
  // TODO implement data types system
}

export function createNode(position: Point2D, type: NodeType): Node {
  return {
    position: position,
    type: type,
    slotConnections: {},
  }
}

export function getNodeLabel(node: Node): string {
  switch (node.type) {
    case NodeType.Math:
      return getMathNodeLabel(node as MathNode)
  }
}

export function getNodeSlots(node: Node): EndpointData[] {
  switch (node.type) {
    case NodeType.Math:
      return getMathNodeSlots()
  }
}

export function getNodeEmitters(node: Node): EndpointData[] {
  switch (node.type) {
    case NodeType.Math:
      return getMathNodeEmitters()
  }
}