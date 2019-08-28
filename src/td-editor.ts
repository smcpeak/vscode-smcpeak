// td-editor.ts
// Port of C++ part of 'editor/td-editor' module.

import {
  getWholeLine,
} from "./td";

import {
  Position,
  Range,
  TextEditor,
} from "vscode";

import * as assert from "assert";


// Get a complete line.  Returns "" when beyond EOF.  'line' must
// be non-negative.
export function getWholeLineString(tde: TextEditor, line: number): string
{
  assert(line >= 0);
  if (line < tde.document.lineCount) {
    return getWholeLine(tde.document, line);
  }
  else {
    return "";
  }
}
