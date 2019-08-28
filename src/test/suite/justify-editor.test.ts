// justify-editor.test.ts
// Tests for 'justify-editor.ts' module.

import {
  justifyNearLine,
} from '../../justify-editor';

import {
  beginCoord,
  debugPrintTE,
  endCoord,
  getDocumentLines,
} from "../../td";

import {
  joinWithSuffix,
} from "../../text-utils";

import {
  debugPrintArray,
  equalElements,
} from "../../array-utils";

import {
  closeAllEditors,
  createRandomFile,
  deleteFile,
} from '../vscode-api-tests/utils';

import {
  Position,
  Range,
  TextDocument,
  TextEditor,
  TextEditorEdit,
  window,
  workspace,
} from 'vscode';

import * as assert from 'assert';


function docToString(te: TextEditor) : string
{
  return te.document.getText();
}


function equalDocuments(te1: TextEditor,
                        te2: TextEditor) : boolean
{
  return docToString(te1) === docToString(te2);
}


function printTE(label: string, te: TextEditor) : void
{
  console.log(label + ":");
  debugPrintTE(te);
}


async function testOneJustifyNearLine(
  te: TextEditor,
  input: string[],
  expect: string[],
  originLine: number,
  desiredWidth : number) : Promise<void>
{
  // Begin by resetting the editor to the desired input state.
  assert(await te.edit((editBuilder: TextEditorEdit) => {
    editBuilder.replace(new Range(beginCoord(te.document), endCoord(te.document)),
      joinWithSuffix(input, "\n"));
  }));

  // Now justify the text at the chosen location and width.
  assert(await te.edit((editBuilder: TextEditorEdit) => {
    justifyNearLine(te, editBuilder, originLine, desiredWidth);
  }));

  // Get the resulting document, asserting that the last line is
  // empty, corresponding to a properly-terminated file.  Then
  // throw away that last line.
  let actual: string[] = getDocumentLines(te.document);
  assert.equal(actual[actual.length-1], "");
  actual = actual.slice(0, actual.length-1);

  // Compare result to what was expected.
  if (!equalElements(expect, actual)) {
    console.log("originLine: " + originLine);
    console.log("desiredWidth: " + desiredWidth);
    debugPrintArray("input", input);
    debugPrintArray("expect", expect);
    debugPrintArray("actual", actual);
    assert(!"justifyTextLines test failure");
  }
}


async function testJustifyNearLine(te: TextEditor) : Promise<void>
{
  {
    let input = [
      "// one two three.  four five six seven eight nine",
      "// ten eleven",
      "// twelve",
    ];

    {
      let output = [
        //              V
        "// one two",
        "// three.  four",
        "// five six",
        "// seven eight",
        "// nine ten",
        "// eleven",
        "// twelve",
      ];

      await testOneJustifyNearLine(te, input, output, 0, 15);
      await testOneJustifyNearLine(te, input, output, 1, 15);
      await testOneJustifyNearLine(te, input, output, 2, 15);
    }

    {
      let output = [
        //                   V
        "// one two three.",
        "// four five six",
        "// seven eight nine",
        "// ten eleven twelve",
      ];

      await testOneJustifyNearLine(te, input, output, 0, 20);
      await testOneJustifyNearLine(te, input, output, 1, 20);
      await testOneJustifyNearLine(te, input, output, 2, 20);
    }

    {
      let output = [
        //                             V
        "// one two three.  four five",
        "// six seven eight nine ten",
        "// eleven twelve",
      ];

      await testOneJustifyNearLine(te, input, output, 1, 30);
    }
  }

  {
    let input = [
      "// one two three.  four five six seven eight nine",
      "// ",
      "// ten eleven",
      "// twelve",
    ];

    {
      let output = [
        //              V
        "// one two",
        "// three.  four",
        "// five six",
        "// seven eight",
        "// nine",
        "// ",
        "// ten eleven",
        "// twelve",
      ];

      await testOneJustifyNearLine(te, input, output, 0, 15);
    }

    await testOneJustifyNearLine(te, input, input, 1, 15);
    await testOneJustifyNearLine(te, input, input, 2, 15);
    await testOneJustifyNearLine(te, input, input, 3, 15);

    {
      let output = [
        //                   V
        "// one two three.",
        "// four five six",
        "// seven eight nine",
        "// ",
        "// ten eleven",
        "// twelve",
      ];

      await testOneJustifyNearLine(te, input, output, 0, 20);
    }

    await testOneJustifyNearLine(te, input, input, 1, 20);

    {
      let output = [
        "// one two three.  four five six seven eight nine",
        "// ",
        "// ten eleven twelve",
      ];

      await testOneJustifyNearLine(te, input, output, 2, 20);
      await testOneJustifyNearLine(te, input, output, 3, 20);
    }
  }

  {
    let input = [
      "one two three.  four five six seven eight nine",
      "ten eleven",
      "twelve",
    ];

    {
      let output = [
        //              V
        "one two three.",
        "four five six",
        "seven eight",
        "nine ten eleven",
        "twelve",
      ];

      await testOneJustifyNearLine(te, input, output, 0, 15);
      await testOneJustifyNearLine(te, input, output, 1, 15);
      await testOneJustifyNearLine(te, input, output, 2, 15);
    }
  }

  {
    let input = [
      "one two three.  four five six seven eight nine",
      "",
      "ten eleven",
      "twelve",
    ];

    {
      let output = [
        //              V
        "one two three.",
        "four five six",
        "seven eight",
        "nine",
        "",
        "ten eleven",
        "twelve",
      ];

      await testOneJustifyNearLine(te, input, output, 0, 15);
    }

    await testOneJustifyNearLine(te, input, input, 1, 15);

    {
      let output = [
        //              V
        "one two three.  four five six seven eight nine",
        "",
        "ten eleven",
        "twelve",
      ];

      await testOneJustifyNearLine(te, input, output, 2, 15);
      await testOneJustifyNearLine(te, input, output, 3, 15);
    }
  }
}


suite('justify-editor tests', () => {

  teardown(closeAllEditors);

  // This function was copied from
  // extensions/vscode-api-tests/src/singlefolder-tests/editor.test.ts
  // in the vscode github repo, version 1.37.1.
  function withRandomFileEditor(initialContents: string, run: (editor: TextEditor, doc: TextDocument) => Thenable<void>): Thenable<boolean> {
    return createRandomFile(initialContents).then(file => {
      return workspace.openTextDocument(file).then(doc => {
        return window.showTextDocument(doc).then((editor) => {
          return run(editor, doc).then(_ => {
            if (doc.isDirty) {
              return doc.save().then(saved => {
                assert.ok(saved);
                assert.ok(!doc.isDirty);
                return deleteFile(file);
              });
            } else {
              return deleteFile(file);
            }
          });
        });
      });
    });
  }

  function buildABCInsert(editBuilder: TextEditorEdit) : void
  {
    editBuilder.insert(new Position(0,0), "abc");
  }

  // This is a very simple test showing how to create an editor,
  // manipulate its contents with an edit, and check that the result
  // is as expected.
  test('insert text', () => {
    return withRandomFileEditor("line1\nline2\n", (editor, doc) => {
      return editor.edit(buildABCInsert).then(fulfilled => {
        assert.ok(fulfilled);
        assert.equal(doc.getText(), "abcline1\nline2\n");
        assert.ok(doc.isDirty);
      });
    });
  });

  // This is a demonstration test using 'async' instead of explicit
  // manipulation of Thenable.
  test('insert text async', async () => {
    await withRandomFileEditor("line1\nline2\n", async (editor, doc) => {
      // Like in my editor, a document is a sequence of lines
      // *separated* by the line terminator, so this document has
      // three lines, not two.
      assert.equal(doc.lineCount, 3);
      let fulfilled = await editor.edit(buildABCInsert);
      assert.ok(fulfilled);
      assert.equal(doc.getText(), "abcline1\nline2\n");
      assert.ok(doc.isDirty);
    });
  });

  // Test that replace works the way I think it should.
  test('replace', async () => {
    await withRandomFileEditor("line 1\nline 2\nline 3\n", async (editor, doc) => {
      let fulfilled = await editor.edit((editBuilder: TextEditorEdit) => {
        editBuilder.replace(new Range(new Position(1,0), new Position(2,0)),
          "new line 2\n");
      });
      assert.ok(fulfilled);
      assert.equal(doc.getText(), "line 1\nnew line 2\nline 3\n");
      assert.ok(doc.isDirty);
    });
  });

  // Does it also work that way at EOF?
  test('replace at EOF', async () => {
    await withRandomFileEditor("line 1\nline 2\nline 3\n", async (editor, doc) => {
      let fulfilled = await editor.edit((editBuilder: TextEditorEdit) => {
        editBuilder.replace(new Range(new Position(2,0), new Position(3,0)),
          "new line 3\n");
      });
      assert.ok(fulfilled);
      assert.equal(doc.getText(), "line 1\nline 2\nnew line 3\n");
      assert.ok(doc.isDirty);
    });
  });

  if (true) {
    test("justify", async () => {
      await withRandomFileEditor("", async (editor, doc) => {
        await testJustifyNearLine(editor);
      });
    });
  }
});
