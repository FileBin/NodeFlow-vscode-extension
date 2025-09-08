import * as vscode from 'vscode';
import { parse, stringify } from 'yaml';
import { NodeDocument } from '../models/nodeDocument';
import path from 'path';

/**
 * Provider for cat scratch editors.
 * 
 * Cat scratch editors are used for `.cscratch` files, which are just json files.
 * To get started, run this extension and open an empty `.cscratch` file in VS Code.
 * 
 * This provider demonstrates:
 * 
 * - Setting up the initial webview for a custom editor.
 * - Loading scripts and styles in a custom editor.
 * - Synchronizing changes between a text document and a custom editor.
 */
export class NodeFlowEditorProvider implements vscode.CustomTextEditorProvider {

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new NodeFlowEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(NodeFlowEditorProvider.viewType, provider);
		return providerRegistration;
	}

	public static readonly viewType = 'nodeFlow.nodeEditor';

	constructor(
		private readonly context: vscode.ExtensionContext
	) { }

	/**
	 * Called when our custom editor is opened.
	 * 
	 * 
	 */
	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,

			localResourceRoots: [
                vscode.Uri.file(
                    path.join(this.context.extensionPath, "vue-dist", "assets")
                ),
            ],
		};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		function updateWebview() {
			webviewPanel.webview.postMessage({
				type: 'update',
				text: NodeFlowEditorProvider.getNodeDocument(document),
			});
		}

		// Hook up event handlers so that we can synchronize the webview with the text document.
		//
		// The text document acts as our model, so we have to sync change in the document to our
		// editor and sync changes in the editor back to the document.
		// 
		// Remember that a single text document can also be shared between multiple custom
		// editors (this happens for example when you split a custom editor)

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview();
			}
		});

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
		});

		// Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
				case 'add':
					// this.addNewNode(document);
					return;

				case 'delete':
					// this.deleteNode(document, e.id);
					return;
			}
		});

		updateWebview();
	}

	/**
	 * Get the static html used for the editor webviews.
	 */
	private getHtmlForWebview(webview: vscode.Webview): string {
		const dependencyNameList: string[] = [
			"index.css",
			"index.js",
		];
		const dependencyList: vscode.Uri[] = dependencyNameList.map((item) =>
			webview.asWebviewUri(
				vscode.Uri.joinPath(this.context.extensionUri, "vue-dist", "assets", item)
			)
		);

	    const webviewRoot = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "vue-dist"));

		const html = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>Vite App</title>
			<script>
				const vscode = acquireVsCodeApi();
				const __webviewRoot__ = "${webviewRoot}"
			</script>
			<script type="module" crossorigin src="${dependencyList[1]}"></script>
			<link rel="stylesheet" href="${dependencyList[0]}">
		</head>
		<body>
			<div id="app"></div>
		</body>
		</html>`;
		return html;
	}

	/**
	 * Try to get a current document as json text.
	 */
	private static getNodeDocument(document: vscode.TextDocument): NodeDocument | null {
		const text = document.getText();
		if (text.trim().length === 0) {
			return null;
		}

		try {
			return parse(text);
		} catch {
			throw new Error('Could not get document as json. Content is not valid json');
		}
	}

	/**
	 * Write out the json to a given document.
	 */
	private updateTextDocument(document: vscode.TextDocument, json: any) {
		const edit = new vscode.WorkspaceEdit();

		// Just replace the entire document every time for this example extension.
		// A more complete extension should compute minimal edits instead.
		edit.replace(
			document.uri,
			new vscode.Range(0, 0, document.lineCount, 0),
			stringify(json, null, 2));

		return vscode.workspace.applyEdit(edit);
	}
}