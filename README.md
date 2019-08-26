# vscode-smcpeak README

These are my vscode extensions.

## Features

smcpeak.insertDateTime: Insert date/time as YYYY-MM-DD HH:SS into editor.

indentRigidly, outdentRigidly: In/outdent without breaking spacing.  See:
https://github.com/Microsoft/vscode/issues/63388

## Installation

My extensions are not in the public extensions repository since they're
mainly for my personal use.  I suppose if someone wants them I could
figure out how to get them uploaded.

Requires [node.js](https://nodejs.org), probably a somewhat recent version,
although I don't know exactly what.  I've been using 10.16.  It should
include the "npm" command at least.

Run:

```
  $ npm install
  $ npm run compile
  $ npm run package
```

That last command creates vscode-smcpeak-$VERSION.vsix.

Then, in vscode, go to Extensions (Ctrl+Shift+X), click the "..." menu
item near the top-left, choose "Install from VSIX...", then navigate to
and choose the .vsix file.

Finally, to use the key bindings I normally use, open
doc/keybindings.json.fragment and copy+paste that into your vscode
key bindings JSON file (Settings -> Keyboard Shortcuts -> Open
Keyboard Shortcuts).  When editing keybindings.json, VSCode
(version 1.37) will complain that the commands do not exist until you
restart it, even though the commands in fact start working right away.
