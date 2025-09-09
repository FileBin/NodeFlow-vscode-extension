import * as vscode from 'vscode';
import { NodeFlowEditorProvider } from '../editors/nodeFlowEditor';
import { Node, NodeTypes } from '../../../shared/models/node';
import { stringify } from 'yaml';

export function registerCreateNodeCommand(): vscode.Disposable {
    const commandId = 'nodeFlow.node.new';

    // The command is registered here and will be available in the Command Palette.
    return vscode.commands.registerCommand(commandId, async () => {
        // Prompt the user for a new file name.
        var picks = Object.values(NodeTypes) as string[];
        picks = picks.splice(0, picks.length/2) as string[];
        const nodeTypes = await vscode.window.showQuickPick(picks, {canPickMany: false});
        const nodeType = nodeTypes?.at(0);

        // If the user cancels, do nothing.
        if (!nodeType) {
            vscode.window.showErrorMessage("No nodeType was selected!");
            return;
        }

        const doc = NodeFlowEditorProvider.activeNodeDocument;

        if (!doc) {
            vscode.window.showErrorMessage("No active document is opened!");
            return;
        }

        createNode(doc, new Node(nodeType));
    });
}

function createNode(document: vscode.TextDocument, node: Node) {
  const edit = new vscode.WorkspaceEdit()

  const nodeDoc = NodeFlowEditorProvider.getNodeDocument(document)

  nodeDoc.nodes.push(node)

  // Just replace the entire document every time for this example extension.
  // A more complete extension should compute minimal edits instead.
  edit.replace(
    document.uri,
    new vscode.Range(0, 0, document.lineCount, 0),
    stringify(nodeDoc)
  );

  return vscode.workspace.applyEdit(edit)
}
