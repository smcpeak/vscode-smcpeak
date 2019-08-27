// justify.ts
// Text justification routines.

// This is a port of the C++ 'editor/justify' module.


// Return true if 'subject' is 'prefix' plus some non-empty suffix.
function properStartsWith(subject: string, prefix: string) : boolean
{
  if (subject.length <= prefix.length) {
    return false;
  }

  return subject.substring(0, prefix.length) === prefix;
}


// Return true if 'c' is punctuation normally found at the end of a
// sentence.  When we have to synthesize space between words, rather
// than copying it, this will determine whether we insert one space or
// two.
//
// 'c' is supposed to be a string of length 1.
function isSentenceEnd(c: string) : boolean
{
  return c === "." || c === "?" || c === "!";
}


// Given 'originalContent', rearrange its whitespace to obtain a
// set of lines that have 'desiredWidth' or less.
//
// If two adjacent words start on the same line, and are not
// split across lines, the number of spaces between them shall
// be preserved.  This provision is based on the idea that the
// author originally put the number of spaces they want to use,
// whether or not that matches my preferred convention.
//
// However, when we have to synthesize space, we insert two
// spaces for what appear to be sentence boundaries, reflecting
// my own typographical preferences.
export function justifyTextLines(
  originalContent: string[],
  desiredWidth: number) : string[]
{
  // Sequence of output lines.
  let justifiedContent: string[] = [];

  // Line being built.
  let curLine: string = "";

  // Process all input lines.
  for (let i /*:number*/ in originalContent) {
    // Current string being decomposed.
    let str: string = originalContent[i];

    // Current offset into 'str'.
    let p: number = 0;

    // Loop over words in 'str'.
    while (true) {
      // Leaving 'p' to point at the start of the whitespace before the
      // word, set 'q' to point at the start of the word itself.
      let q: number = p;
      while (q < str.length && str[q] === " ") {
        q++;
      }

      if (q === str.length) {
        // No more words in this line.
        break;
      }

      // Advance 'r' to one past the last character in the word.
      let r: number = q+1;
      while (r < str.length && str[r] !== " ") {
        r++;
      }

      // How many spaces go before this word?
      let spaces: number = q-p;
      if (spaces === 0) {
        // Are we at a sentence boundary?
        if (curLine.length > 0 &&
            isSentenceEnd(curLine[curLine.length-1])) {
          spaces = 2;
        }
        else {
          spaces = 1;
        }
      }

      // Would adding this word make the line too long?
      if (curLine.length + spaces + (r-q) > desiredWidth) {
        // Yes, emit the existing line and start a new one.
        if (curLine !== "") {
          justifiedContent.push(curLine);
          curLine = "";
        }
        curLine += str.substring(q, r);
      }
      else {
        // No, can add it.
        if (curLine !== "") {
          while (spaces--) {
            curLine += " ";
          }
        }
        curLine += str.substring(q, r);
      }

      p = r;
    } // loop over input words
  } // loop over input lines

  // Emit the partial line if not empty.
  if (curLine !== "") {
    justifiedContent.push(curLine);
  }

  return justifiedContent;
}
