// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Return 'n' as a string, padded to two digits.
// It works for integer 'n' in [0,99].
function dd(n: number) : string {
  if (n < 10) {
    return "0" + n;
  }
  else {
    return "" + n;
  }
}

// Return the current date/time as "YYYY-MM-DD HH:MM".
function currentDateTime() : string {
  let d = new Date();
  return "" + d.getFullYear() +
         "-" + dd(d.getMonth()+1) +
         "-" + dd(d.getDate()) +
         " " + dd(d.getHours()) +
         ":" + dd(d.getMinutes());
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // To bind this to a key:
  //  * Settings (lower-left gear) -> Keyboard Shortcuts
  //  * Switch to JSON mode (brace pair in top right)
  //  * Insert the following JSON:
  //      {
  //        "key": "ctrl+shift+d",
  //        "command": "smcpeak.insertDateTime",
  //        "when": "editorTextFocus"
  //      },
  let disposable = vscode.commands.registerTextEditorCommand('smcpeak.insertDateTime',
    (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
      edit.insert(textEditor.selection.active, currentDateTime());
    });
  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
