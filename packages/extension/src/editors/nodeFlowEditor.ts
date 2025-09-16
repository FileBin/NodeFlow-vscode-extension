import path from 'path';
import * as vscode from 'vscode';
import { parse } from 'yaml';

import { NodeDocument } from '../../../shared/models/nodeDocument';
import { DocumentUpdatedReport, Message, MessageType, SetNodeCreatePositionReport } from '../../../shared/models/message';
import { Point2D } from '../../../shared/models/util';

export class NodeFlowEditorProvider implements vscode.CustomTextEditorProvider {

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new NodeFlowEditorProvider(context);
		const providerRegistration = 
		vscode.window.registerCustomEditorProvider(NodeFlowEditorProvider.viewType, provider, {
			supportsMultipleEditorsPerDocument: true,
		});
		return providerRegistration;
	}

	public static readonly viewType = 'nodeFlow.nodeEditor';

	private static _nodeCreationPosition: Point2D = {
		x: 0,
		y: 0,
	};

	public static get nodeCreationPosition(): Point2D {
		return NodeFlowEditorProvider._nodeCreationPosition;
	}

	private static _activeNodeDocument: vscode.TextDocument | null = null;

	public static get activeNodeDocument(): vscode.TextDocument | null {
		return NodeFlowEditorProvider._activeNodeDocument;
	}

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
			webviewPanel.webview.postMessage(
				new DocumentUpdatedReport(
					NodeFlowEditorProvider.getSerializedNodeDocument(document)));
		}

		function updateActiveDocument(wp: vscode.WebviewPanel) {
			if(wp.active) {
				NodeFlowEditorProvider._activeNodeDocument = document;
			} else {
				if (NodeFlowEditorProvider._activeNodeDocument === document) {
          			NodeFlowEditorProvider._activeNodeDocument = null;
        		}
			}
		}

		updateActiveDocument(webviewPanel);

		const changeStateSubscription = webviewPanel.onDidChangeViewState(e => {
			updateActiveDocument(e.webviewPanel);
		});

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
			changeStateSubscription.dispose();
		});

		// Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage(e => {
			const message = e as Message

			switch (message.type) {
				case MessageType.setNodeCreatePosition:
					const m = message as SetNodeCreatePositionReport

					NodeFlowEditorProvider._nodeCreationPosition = m.pos
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
	public static getSerializedNodeDocument(document: vscode.TextDocument): NodeDocument {
		const text = document.getText();
		if (text.trim().length === 0) {
			throw new Error('TextDocument is empty');
		}

		try {
			return parse(text);
		} catch {
			throw new Error('Failed to parse textDocument as NodeDocument');
		}
	}
}