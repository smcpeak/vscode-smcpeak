// td.ts
// Port of part of 'editor/td' and 'editor/td-core' modules.

import {
  Position,
  Range,
  TextDocument,
  TextEditor,
} from "vscode";

import * as assert from "assert";


/** bounds check line */
function bc(td: TextDocument, line: number) : void
{
  assert(0 <= line && line < td.lineCount);
}


/** First valid coordinate. */
export function beginCoord(td: TextDocument) : Position
{
  return new Position(0,0);
}


/** Last valid coordinate. */
export function endCoord(td: TextDocument) : Position
{
  if (td.lineCount >= 1) {
    return lineEndCoord(td, td.lineCount-1);
  }
  else {
    return beginCoord(td);
  }
}


/** Coordinates for beginning of a line, which must be valid. */
export function lineBeginCoord(td: TextDocument, line: number) : Position
{
  bc(td, line);
  return td.lineAt(line).range.start;
}


/** Coordinates for end of a line, which must be valid. */
export function lineEndCoord(td: TextDocument, line: number) : Position
{
  bc(td, line);
  return td.lineAt(line).range.end;
}


/** Get a complete line of text, not including the newline.  'line'
  * must be within range. */
export function getWholeLine(td: TextDocument, line: number) : string
{
  bc(td, line);
  return td.lineAt(line).text;
}


/** Return the lines in 'td' as an array. */
export function getDocumentLines(td: TextDocument) : string[]
{
  let ret: string[] = [];
  for (let i: number = 0; i < td.lineCount; i++) {
    ret.push(getWholeLine(td, i));
  }
  return ret;
}


export function debugPrintLines(lines: string[]) : void
{
  for (let i in lines) {
    console.log("  line " + i + ": " + JSON.stringify(lines[i]));
  }
}


export function debugPrintTE(te: TextEditor) : void
{
  let td: TextDocument = te.document;

  debugPrintLines(getDocumentLines(td));

  console.log("  cursor: " + JSON.stringify(te.selection.active));
  console.log("  anchor: " + JSON.stringify(te.selection.anchor));

  let vr: Range[] = te.visibleRanges;
  for (let i in vr) {
    console.log("  vr[" + i + "]: " + JSON.stringify(vr[i]));
  }

  console.log("  tabSize: " + te.options.tabSize);
}
