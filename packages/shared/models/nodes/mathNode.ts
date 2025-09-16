import { createNode, NodeType, type EndpointData, type Node } from "../node";
import type { Point2D } from "../util";

//TODO make configuration through props
export enum MathOperation {
    add = '+',
    sub = '-',
    mul = '*',
    div = '/',
    mod = '%',
    power = '^',
    sqrt = '√',
}

export interface MathNodeData {
  mathOperation: MathOperation;
}

export interface MathNode extends Node {
  typeData: MathNodeData,
};

export const getMathNodeSlots = (): EndpointData[] => [
  {
    name: "calculate"
  }
]

export const getMathNodeEmitters = (): EndpointData[] => [
  {
    name: "onCalculated"
  }
]

export function createMathNode(position: Point2D, typeData: MathNodeData) : MathNode {
  return { ...createNode(position, NodeType.Math), typeData }
}

export function getMathNodeLabel(node: MathNode) : string {
  return node.typeData.mathOperation;
}