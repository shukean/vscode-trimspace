'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // context.subscriptions.push(new LineTrimmer());
    let trimer = new fileTrimer();

    var ScpTrimer = vscode.commands.registerCommand('yautotrim.autotrimSaveFile', () => {
        trimer.trim();
    });

    var CsTrimer = vscode.workspace.onDidSaveTextDocument((doc: vscode.TextDocument) => {
        trimer.trim();
    });

    context.subscriptions.push(trimer);
    context.subscriptions.push(ScpTrimer);
    context.subscriptions.push(CsTrimer);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

class fileTrimer {

    // private _disposable: vscode.Disposable;
    private _lines = new WeakMap<any, Set<number>>();
    // private _statusBarItem: vscode.StatusBarItem;

    constructor() {
        // this._disposable = vscode.window.onDidChangeTextEditorSelection(this.onChangeSelection, this);
        // this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)
    }

    public onChangeSelection(e: vscode.TextEditorSelectionChangeEvent) {
        let editor = vscode.window.activeTextEditor;
        let doc = editor.document;
        let isMarkdown = doc.languageId == 'markdown';
        let lines = new Set<number>(e.selections.map(sel => sel.active.line));
        let previousLines = this._lines.get(doc);
        let rpl = isMarkdown ? '  ' : '';
        if(previousLines) {
            previousLines.forEach(lineNum => {
                if(!lines.has(lineNum) && doc.lineCount > lineNum) {
                    const line = doc.lineAt(lineNum);
                    if(!line) {
                        return;
                    }
                    const text = line.isEmptyOrWhitespace ? '' : line.text.replace(/[ \t]+$/, rpl);
                    if(line.text !== text) {
                        editor.edit(ed => ed.replace(line.range, text));
                    }
                }
            });
        }
        this._lines.set(doc, lines);
    }

    public trim() {  
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            // this._statusBarItem.hide();
            return;
        }
        let doc = editor.document;
        let isMarkdown = doc.languageId == 'markdown';
        let rpl = isMarkdown ? '  ' : '';
        let lineNum = doc.lineCount;
        var i = 0;
        for (var i=0; i<lineNum; i++) {
            let line = doc.lineAt(i);
            let text = line.isEmptyOrWhitespace ? '' : line.text.replace(/[ \t]+$/, rpl);
            if (text !== line.text) {
                editor.edit(ed => ed.replace(line.range, text));
                i++;
            }
        }
        // this._statusBarItem.text = "Trim Done: " + i;
        // this._statusBarItem.show();
        vscode.window.showInformationMessage("Trim done");
    }

    dispose() {
        // this._disposable.dispose()
        // this._statusBarItem.dispose()
    }
}