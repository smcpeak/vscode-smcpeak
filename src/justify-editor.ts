// justify-editor.ts
// Text justification as applied to a VSCode TextEditor.

// This is a port of part of the C++ 'editor/justify' module.

import {
  justifyTextLines,
  properStartsWith,
} from "./justify";

import {
  getWholeLine,
  lineBeginCoord,
} from "./td";

import {
  joinWithPreSuffix,
} from "./text-utils";

import {
  Range,
  TextDocument,
  TextEditor,
  TextEditorEdit,
} from "vscode";

//import * as assert from "assert";


// Heuristically identify the textual framing used for the text at
// and surrounding 'originLine', separate it from the content, wrap the
// content to the result will fit into 'desiredWidth' columns if
// possible, and replace the identified region with its wrapped
// version.  Return false if we could not identify a wrappable
// region.
export function justifyNearLine(
  tde: TextEditor,
  editBuilder: TextEditorEdit,
  originLineNumber: number,
  desiredWidth: number) : boolean
{
  let td: TextDocument = tde.document;
  let startLine: string = getWholeLine(td, originLineNumber);

  // Split the line into a prefix of whitespace and framing punctuation,
  // and a suffix with alphanumeric content.  In a programming language,
  // the prefix is intended to be the comment symbol and indentation.
  // In plain text, the prefix may be empty.
  let re: RegExp = /^([^a-zA-Z'\"0-9`$()_]*)(.*)$/;
  let match = re.exec(startLine);
  if (!match) {
    return false;
  }
  if (match[2] === "") {
    // No content.  (Note: I cannot get rid of this test by changing
    // the regex to end with ".+" instead of ".*" because I want the
    // prefix to be as long as possible, whereas with ".+" the regex
    // engine might choose to move a prefix character into the
    // content text group.)
    return false;
  }

  // Grab the prefix string.
  let prefix: string = match[1];

  // Look for adjacent lines that start with the same prefix and have
  // some content after it.
  let upperEdge: number = originLineNumber;
  while (upperEdge-1 >= 0) {
    if (properStartsWith(getWholeLine(td, upperEdge-1), prefix)) {
      upperEdge--;
    }
    else {
      break;
    }
  }
  let lowerEdge: number = originLineNumber;
  while (lowerEdge+1 < td.lineCount) {
    if (properStartsWith(getWholeLine(td, lowerEdge+1), prefix)) {
      lowerEdge++;
    }
    else {
      break;
    }
  }

  // Put all the content into a sequence of lines.
  let originalContent: string[] = [];
  for (let i=upperEdge; i <= lowerEdge; i++) {
    let line: string = getWholeLine(td, i);
    originalContent.push(line.substring(prefix.length));
  }

  // Reformat it.
  let justifiedContent: string[] =
    justifyTextLines(originalContent, desiredWidth - prefix.length);

  // Turn that into a string with the prefix added.
  let justifiedContentString: string =
    joinWithPreSuffix(justifiedContent, prefix, "\n");

  // Replace the content.
  editBuilder.replace(
    new Range(lineBeginCoord(td, upperEdge), lineBeginCoord(td, lowerEdge+1)),
    justifiedContentString);
  
  return true;
}
