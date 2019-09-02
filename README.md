# vscode-smcpeak README

These are my vscode extensions, mostly for my personal use, although
I've also started citing them in [StackOverflow](https://stackoverflow.com)
answers.

## Features

New commands accessible in the Command Palette in the "smcpeak" namespace:

* insertDateTime: Insert date/time as YYYY-MM-DD HH:SS into editor.

* indentRigidly, outdentRigidly: In/outdent without breaking spacing.  See:
  https://github.com/Microsoft/vscode/issues/63388

* cursorHome, cursorHomeSelect: Move to true start of line (not first non-whitespace).
  Based on
  [Extended Cursor Movements](https://marketplace.visualstudio.com/items?itemName=BillStewart.extended-cursormove).

* justifyParagraph: Fill/justify paragraph of text, comments, etc.
  Similar to
  [Rewrap](https://marketplace.visualstudio.com/items?itemName=stkb.rewrap).
  I implemented mine mostly to learn how to do it rather than because
  of any known deficiency in Rewrap (which I have not tried yet).

New commands *not* accessible in the palette, but rather meant to be used from
[macros](https://marketplace.visualstudio.com/items?itemName=geddski.macros).
They are also in the "smcpeak" namespace:

* goToLineMatching: Move the cursor, and possibly the anchor, to a line
  that matches a specified regex.  The argument object has the following
  properties:

  - regex (string): Regex to match against complete lines while searching.
    This attribute is required, while all others are optional.

  - caseInsensitive (boolean): True to match case-insensitively.

  - moveUp (boolean): True to move up, whereas the default moves down.

  - allowZeroMove (boolean): True to allow matching the current line,
    and hence not moving at all.

  - select (boolean): True to leave the anchor where it is, thereby
    creating or extending the selection.  Otherwise, anchor is moved
    to cursor, resulting in nothing being selected.

* revealCurrentSelection: Scroll the active editor window so its selection
  is visible.

## Installation

My extensions are not in the [extensions marketplace](https://marketplace.visualstudio.com/vscode)
since they're mainly for my personal use.  I suppose if someone wants
them I could figure out how to get them uploaded.

Meanwhile, I'll put VSIX files into the
[releases](https://github.com/smcpeak/vscode-smcpeak/releases)
section of the github repo.

* VSIX files are just .zip files with a different extension, so if you
  want to verify its contents, just rename it to have the ".zip"
  extension and unpack it.

To install a VSIX file, in vscode, go to Extensions (Ctrl+Shift+X),
click the "..." menu item near the top-left, choose "Install from
VSIX...", then navigate to and choose the .vsix file.

Finally, to use the key bindings I normally use, open
doc/keybindings.json.fragment and copy+paste that into your vscode key
bindings JSON file (Settings → Keyboard Shortcuts → Open Keyboard
Shortcuts).  When editing keybindings.json immediately after installing
the extension, VSCode (version 1.37) will complain that the commands do
not exist until you restart it, even though the commands in fact start
working right away.

## Building from source

Compilation requires [node.js](https://nodejs.org), probably a somewhat
recent version, although I don't know exactly what.  I've been using
10.16.  It should include the "npm" command at least.

Run:

```
  $ npm install
  $ npm run compile
  $ npm run package
```

That last command creates vscode-smcpeak-$VERSION.vsix.

If you change the code and want to reinstall without changing the
version number, you have to uninstall the old version and remove the
cached copy in $HOME/.vscode/extensions (substitute %USERPROFILE% for
$HOME on Windows) first.  Otherwise VSCode will just reinstall the old
one, even when you select the new VSIX file.

