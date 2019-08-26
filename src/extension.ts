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

function insertDateTime(
  textEditor: vscode.TextEditor,
  edit: vscode.TextEditorEdit)
{
  edit.insert(textEditor.selection.active, currentDateTime());
}

function spaces(n: number) : string
{
  var ret = "";
  for (var i=0; i<n; i++) {
    ret += " ";
  }
  return ret;
}

function inOrOutdentRigidly(
  textEditor: vscode.TextEditor,
  edit: vscode.TextEditorEdit,
  amount: number)
{
  const s = textEditor.selection;
  if (s.isEmpty) {
    if (amount > 0) {
      // Insert a tab character.
      edit.insert(s.active, "\t");

      // This would run the original vscode Tab function, which
      // inserts spaces if that is how indentation is configured.
      //vscode.commands.executeCommand("tab");
    }
    else {
      // Do nothing.
    }
    return;
  }

  // Current selected text, expanded to include the beginning of the
  // start line.
  const range = new vscode.Range(
    new vscode.Position(s.start.line, 0),
    new vscode.Position(s.end.line, s.end.character));

  const oldText = textEditor.document.getText(range);
  const lines = oldText.split(/\r?\n/);
  const eol = textEditor.document.eol === vscode.EndOfLine.LF? "\n" : "\r\n";

  // Build replacement text one line at a time.
  var newText = "";
  for (var n=0; n < lines.length; n++) {
    const line = lines[n];

    // Only in/outdent lines that are not empty.
    if (line !== "") {
      if (amount > 0) {
        newText += spaces(amount) + line;
      }
      else {
        // Replace up to -amount leading spaces.
        const newLine = line.replace(
          new RegExp("^[ ]{0," + (-amount) + "}"), "");
        newText += newLine;
      }
    }

    // The last element of the array was not followed by a
    // newline, so do not add one back in.
    if (n < lines.length - 1) {
      newText += eol;
    }
  }

  edit.replace(range, newText);
}

function indentRigidly(
  textEditor: vscode.TextEditor,
  edit: vscode.TextEditorEdit)
{
  inOrOutdentRigidly(textEditor, edit, +2);
}

function outdentRigidly(
  textEditor: vscode.TextEditor,
  edit: vscode.TextEditorEdit)
{
  inOrOutdentRigidly(textEditor, edit, -2);
}

// Move the cursor to the start of the line, regardless of leading
// whitespace.
function cursorHome(select: boolean)
  : (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => void
{
  function actualCommand(
    textEditor: vscode.TextEditor,
    edit: vscode.TextEditorEdit) : void
  {
    // Based on: https://github.com/Bill-Stewart/vscode-extended-cursormove
    vscode.commands.executeCommand("cursorMove", {
      to: "wrappedLineStart",
      by: "line",
      select: select,
      value: 1
    });
  }

  return actualCommand;
}

// Register a text editor command.
function registerTEC(
  context: vscode.ExtensionContext,
  command: string,
  callback: (textEditor: vscode.TextEditor,
             edit: vscode.TextEditorEdit, ...args: any[]) => void)
{
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(command, callback));
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // To bind these to keys:
  //  * Settings (lower-left gear) -> Keyboard Shortcuts
  //  * Switch to JSON mode (brace pair in top right)
  //  * Insert the JSON in doc/keybindings.json.fragment

  registerTEC(context, 'smcpeak.cursorHome', cursorHome(false));
  registerTEC(context, 'smcpeak.cursorHomeSelect', cursorHome(true));
  registerTEC(context, 'smcpeak.insertDateTime', insertDateTime);
  registerTEC(context, 'smcpeak.indentRigidly', indentRigidly);
  registerTEC(context, 'smcpeak.outdentRigidly', outdentRigidly);
}

// this method is called when your extension is deactivated
export function deactivate() {}
