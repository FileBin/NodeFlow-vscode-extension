import * as vscode from 'vscode';
import { NodeFlowEditorProvider } from './editors/nodeFlowEditor';
import { registerCreateNodeFlowFileCommand } from './commands/createNodeFlowCommand';

export function activate(context: vscode.ExtensionContext) {
	// Register our custom editor providers
	context.subscriptions.push(NodeFlowEditorProvider.register(context));
	
	context.subscriptions.push(registerCreateNodeFlowFileCommand());
}