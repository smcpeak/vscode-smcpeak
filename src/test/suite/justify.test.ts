// justify.test.ts
// Tests for 'justify.ts' module.

// These tests can be run from the command line without starting vscode:
//
//   $ npm run compile
//   $ ./node_modules/mocha/bin/mocha out/test/suite/justify.test.js


import * as assert from 'assert';
import * as mocha from 'mocha';

import * as justify from '../../justify';

import {
  debugPrintArray,
  equalElements,
} from "../../array-utils";


function testOneJustifyTextLines(
  original: string[],
  expect: string[],
  desiredWidth: number) : void
{
  let actual: string[] = justify.justifyTextLines(original, desiredWidth);

  if (!equalElements(expect, actual)) {
    console.log("desiredWidth: " + desiredWidth);
    debugPrintArray("original", original);
    debugPrintArray("expect", expect);
    debugPrintArray("actual", actual);
    assert(!"justifyTextLines test failure");
  }

  // Confirm that indentation is idempotent.
  actual = justify.justifyTextLines(expect, desiredWidth);

  if (!equalElements(expect, actual)) {
    console.log("desiredWidth: " + desiredWidth);
    debugPrintArray("expect", expect);
    debugPrintArray("actual", actual);
    assert(!"justifyTextLines idempotence test failure");
  }
}

function testJustifyTextLines() : void
{
  {
    let in1: string[] = [
      "a b c d e f g h i",
    ];
    let in2: string[] = [
      "a b c d",
      "e f g h i",
    ];
    let in3: string[] = [
      "a b c d  ",
      "e f g h i",
    ];

    function TEST_MULTI(output: string[], width: number) : void
    {
      testOneJustifyTextLines(in1, output, width);
      testOneJustifyTextLines(in2, output, width);
      testOneJustifyTextLines(in3, output, width);
    }

    {
      let output: string[] = [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
      ];
      TEST_MULTI(output, -1);
      TEST_MULTI(output, 0);
      TEST_MULTI(output, 1);
      TEST_MULTI(output, 2);
    }

    {
      let output: string[] = [
        "a b",
        "c d",
        "e f",
        "g h",
        "i",
      ];
      TEST_MULTI(output, 3);
      TEST_MULTI(output, 4);
    }

    {
      let output: string[] = [
        "a b c",
        "d e f",
        "g h i",
      ];
      TEST_MULTI(output, 5);
      TEST_MULTI(output, 6);
    }

    {
      let output: string[] = [
        "a b c d",
        "e f g h",
        "i",
      ];
      TEST_MULTI(output, 7);
      TEST_MULTI(output, 8);
    }

    {
      let output: string[] = [
        "a b c d e f g h i",
      ];
      TEST_MULTI(output, 17);
      TEST_MULTI(output, 18);
    }
  }

  {
    let input: string[] = [
      "one two three four five six seven eight nine  ten eleven twelve",
    ];

    function TEST_MULTI(output: string[], width: number) : void
    {
      testOneJustifyTextLines(input, output, width);
    }

    {
      let output: string[] = [
        "one two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine",
        "ten",
        "eleven",
        "twelve",
      ];
      TEST_MULTI(output, 7);
    }

    {
      let output: string[] = [
        "one two",
        "three four",
        "five six",
        "seven",
        "eight nine",
        "ten eleven",
        "twelve",
      ];
      TEST_MULTI(output, 10);
    }

    {
      let output: string[] = [
        "one two three four",
        "five six seven eight",
        "nine  ten eleven",
        "twelve",
      ];
      TEST_MULTI(output, 20);
    }
  }

  {
    let input: string[] = [
      "one. two three four. five six seven eight nine.  ten eleven. twelve",
    ];

    function TEST_MULTI(output: string[], width: number) : void
    {
      testOneJustifyTextLines(input, output, width);
    }

    {
      let output: string[] = [
        "one.",
        "two",
        "three",
        "four.",
        "five",
        "six",
        "seven",
        "eight",
        "nine.",
        "ten",
        "eleven.",
        "twelve",
      ];
      TEST_MULTI(output, 7);
    }

    {
      let output: string[] = [
        "one. two",
        "three",
        "four. five",
        "six seven",
        "eight",
        "nine.  ten",
        "eleven.",
        "twelve",
      ];
      TEST_MULTI(output, 10);
    }

    {
      let output: string[] = [
        "one. two three four.",
        "five six seven eight",
        "nine.  ten eleven.",
        "twelve",
      ];
      TEST_MULTI(output, 20);
    }
  }
}


mocha.suite('justify', () => {
  mocha.test("testJustifyTextLines", testJustifyTextLines);
});
