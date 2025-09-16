import * as vscode from 'vscode';
import * as path from 'path';
import { NodeFlowEditorProvider } from '../editors/nodeFlowEditor';
import { CreateEmptyNodeDocument, NodeDocument, NodeDocumentType } from '../../../shared/models/nodeDocument';
import { stringify } from 'yaml';

export function registerCreateNodeFileCommand(): vscode.Disposable {
    const commandId = 'nodeFlow.file.new';

    // The command is registered here and will be available in the Command Palette.
    return vscode.commands.registerCommand(commandId, async () => {
        // Prompt the user for a new file name.
        const fileName = await vscode.window.showInputBox({
            prompt: 'Enter the name for your new NodeFlow file',
            value: 'newNode',
            ignoreFocusOut: true
        });

        // If the user cancels, do nothing.
        if (!fileName) {
            return;
        }

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('Please open a workspace folder to create a file.');
            return;
        }

        // Use the first workspace folder as the root for the new file.
        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        const filePath = path.join(workspaceRoot, `${fileName.endsWith('.nf') ? fileName : `${fileName}.nf`}`);
        const fileUri = vscode.Uri.file(filePath);

        // Check if the file already exists.
        try {
            await vscode.workspace.fs.stat(fileUri);
            // File exists, ask the user if they want to overwrite it.
            const overwrite = await vscode.window.showWarningMessage(
                `A file with the name "${fileName}" already exists. Do you want to overwrite it?`,
                'Yes',
                'No'
            );
            if (overwrite !== 'Yes') {
                return;
            }
        } catch {
            // File does not exist, which is what we want.
        }

        // A basic YAML structure for a new NodeFlow file.


        try {
            // Write the new content to the file.
            const nodeDoc = CreateEmptyNodeDocument(NodeDocumentType.component);
            const newDocumentContent = stringify(nodeDoc);

            const content = Buffer.from(newDocumentContent, 'utf8');
            await vscode.workspace.fs.writeFile(fileUri, content);

            // Open the new file in the custom editor.
            const document = await vscode.workspace.openTextDocument(fileUri);
            await vscode.window.showTextDocument(document, { viewColumn: vscode.ViewColumn.Active });
        } catch {
			vscode.commands.executeCommand('vscode.openWith', fileUri, NodeFlowEditorProvider.viewType);
        }
    });
}
