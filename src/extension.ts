// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import {
  justifyNearLine,
} from "./justify-editor";

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

function justifyParagraph(textEditor: vscode.TextEditor,
  editBuilder: vscode.TextEditorEdit) : void
{
  let config = vscode.workspace.getConfiguration("smcpeak");
  let width: number = config.get("justifyWrapColumn", 72);

  let curLine: number = textEditor.selection.active.line;
  justifyNearLine(textEditor, editBuilder, curLine, width);
}

// Scroll to expose the current selection.  This is sometimes useful
// as part of a macro.
function revealCurrentSelection() : void
{
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  editor.revealRange(editor.selection);
}

// Return a position at the start of 'lineNo'.
function linePosition(lineNo: number) : vscode.Position
{
  return new vscode.Position(lineNo, 0);
}

// Return a range encompassing 'lineNo'.
function lineRange(lineNo: number) : vscode.Range
{
  return new vscode.Range(linePosition(lineNo), linePosition(lineNo+1));
}

// function rangeToSelection(range: vscode.Range) : vscode.Selection
// {
//   return new vscode.Selection(range.start, range.end);
// }

// Options for 'goToLineMatching'.
interface GoToMatchOptions {
  // Regex to match against complete lines while searching.  This
  // attribute is required, while all others are optional.
  regex: string;

  // True to match case-insensitively.
  caseInsensitive: boolean | undefined;

  // True to move up, whereas the default moves down.
  moveUp: boolean | undefined;

  // True to allow matching the current line, and hence not moving at
  // all.
  allowZeroMove: boolean | undefined;

  // True to leave the anchor where it is, thereby creating or extending
  // the selection.
  select: boolean | undefined;
}

// Move the cursor, and optionally the anchor, to a line that matches a
// specified regex.
function goToLineMatching(opts: GoToMatchOptions)
{
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  // Compile regex.
  let re: RegExp;
  try {
    // There is no point in exposing any flags other than "i" in
    // this context.
    re = new RegExp(opts.regex, opts.caseInsensitive? "i" : "");
  }
  catch (e) {
    vscode.window.showErrorMessage(
      `goDownToLineMatching: invalid regex: ${JSON.stringify(opts.regex)}`);
    return;
  }

  // Decide where to start searching.
  let lineNo: number = editor.selection.active.line;
  if (!opts.allowZeroMove) {
    lineNo += (opts.moveUp? -1 : +1);
  }

  // Scan for a matching line.
  while (0 <= lineNo && lineNo < editor.document.lineCount) {
    let text: string = editor.document.getText(lineRange(lineNo));
    if (text.match(re)) {
      break;
    }
    lineNo += (opts.moveUp? -1 : +1);
  }

  // If none matched, use the first or last line in the document.
  if (!( 0 <= lineNo && lineNo < editor.document.lineCount )) {
    lineNo = (opts.moveUp? 0 : editor.document.lineCount-1);
  }

  // Move cursor and possibly anchor to start of 'lineNo'.
  let pos = linePosition(lineNo);
  editor.selection = new vscode.Selection(
    (opts.select? editor.selection.anchor: pos),
    pos);
}

// Register a text editor command.
function registerTEC(
  context: vscode.ExtensionContext,
  command: string,
  callback: (textEditor: vscode.TextEditor,
             edit: vscode.TextEditorEdit, ...args: any[]) => void) : void
{
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(command, callback));
}

// Register a normal command.
function registerCmd(
  context: vscode.ExtensionContext,
  command: string,
  callback: (...args: any[]) => any) : void
{
  context.subscriptions.push(
    vscode.commands.registerCommand(command, callback));
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
  registerTEC(context, 'smcpeak.justifyParagraph', justifyParagraph);

  registerCmd(context, "smcpeak.goToLineMatching", goToLineMatching);
  registerCmd(context, "smcpeak.revealCurrentSelection", revealCurrentSelection);
}

// this method is called when your extension is deactivated
export function deactivate() {}
