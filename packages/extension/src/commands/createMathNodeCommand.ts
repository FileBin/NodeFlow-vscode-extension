import * as vscode from 'vscode';
import { NodeFlowEditorProvider } from '../editors/nodeFlowEditor';
import { Node } from '../../../shared/models/node';
import { stringify } from 'yaml';
import { createMathNode, MathNodeData, MathOperation } from '../../../shared/models/nodes/mathNode';
import { addNodeToDocument } from '../../../shared/models/nodeDocument';

export function registerCreateMathNodeCommand(): vscode.Disposable {
    const commandId = 'nodeFlow.node.math.new';

    // The command is registered here and will be available in the Command Palette.
    return vscode.commands.registerCommand(commandId, async () => {
        // Prompt the user for a new file name.
        var picks = Object.values(MathOperation) as string[];
        picks = picks.splice(0, picks.length/2) as string[];
        const nodeTypes = await vscode.window.showQuickPick(picks, {canPickMany: false});
        const mathOperation = nodeTypes?.at(0) as MathOperation;

        // If the user cancels, do nothing.
        if (!mathOperation) {
            vscode.window.showErrorMessage("No nodeType was selected!");
            return;
        }

        const doc = NodeFlowEditorProvider.activeNodeDocument;

        if (!doc) {
            vscode.window.showErrorMessage("No active document is opened!");
            return;
        }

        const nodeData: MathNodeData = {
          mathOperation: MathOperation.add
        }

        createNode(doc, createMathNode(NodeFlowEditorProvider.nodeCreationPosition, nodeData));
    });
}

function createNode(document: vscode.TextDocument, node: Node) {
  const edit = new vscode.WorkspaceEdit()

  const nodeDoc = NodeFlowEditorProvider.getSerializedNodeDocument(document)

  addNodeToDocument(nodeDoc, node);

  // Just replace the entire document every time for this example extension.
  // A more complete extension should compute minimal edits instead.
  edit.replace(
    document.uri,
    new vscode.Range(0, 0, document.lineCount, 0),
    stringify(nodeDoc)
  );

  return vscode.workspace.applyEdit(edit)
}
