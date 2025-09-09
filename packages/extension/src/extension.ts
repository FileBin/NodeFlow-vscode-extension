import * as vscode from 'vscode';
import { NodeFlowEditorProvider } from './editors/nodeFlowEditor';
import { registerCreateNodeFileCommand } from './commands/createNodeFileCommand';
import { registerCreateNodeCommand } from './commands/createNodeCommand';

export function activate(context: vscode.ExtensionContext) {
	// Register our custom editor providers
	context.subscriptions.push(NodeFlowEditorProvider.register(context));
	
	context.subscriptions.push(registerCreateNodeFileCommand());
	context.subscriptions.push(registerCreateNodeCommand());
}