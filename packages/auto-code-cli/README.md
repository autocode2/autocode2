## Table of contents

<!-- toc -->

<!-- tocstop -->

## Usage

<!-- usage -->

```sh-session
$ npm install -g @autocode2/cli
$ auto-code-cli COMMAND
running command...
$ auto-code-cli (--version)
@autocode2/cli/0.0.0-development linux-x64 node-v22.1.0
$ auto-code-cli --help [COMMAND]
USAGE
  $ auto-code-cli COMMAND
...
```

<!-- usagestop -->

## Commands

<!-- commands -->

- [`auto-code-cli code:run [PROMPT]`](#auto-code-cli-coderun-prompt)
- [`auto-code-cli context:list`](#auto-code-cli-contextlist)
- [`auto-code-cli test`](#auto-code-cli-test)

## `auto-code-cli code:run [PROMPT]`

Run the code agent

```
USAGE
  $ auto-code-cli code:run [PROMPT] [--json] [-x <value>...] [--include <value>...] [--excludeFrom <value>]
    [-i <value>] [-o <value>] [-m <value>]

ARGUMENTS
  PROMPT  Message to send to the code agent

FLAGS
  -i, --inputFile=<value>    Read message from file
  -m, --model=<value>        [default: sonnet] Model name or alias to use (opus, sonnet, haiku)
  -o, --outputFile=<value>   Write trace output to file
  -x, --exclude=<value>...   exclude files matching pattern
      --excludeFrom=<value>  exclude files matching patterns contained in file
      --include=<value>...   include files matching pattern

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Run the code agent

EXAMPLES
  $ auto-code-cli code:run
```

_See code: [dist/commands/code/run.js](https://github.com/autocode2/autocode2/blob/v0.0.0-development/dist/commands/code/run.js)_

## `auto-code-cli context:list`

List the files sent to the LLM as context

```
USAGE
  $ auto-code-cli context:list [--json] [-x <value>...] [--include <value>...] [--excludeFrom <value>]

FLAGS
  -x, --exclude=<value>...   exclude files matching pattern
      --excludeFrom=<value>  exclude files matching patterns contained in file
      --include=<value>...   include files matching pattern

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List the files sent to the LLM as context

EXAMPLES
  $ auto-code-cli context:list
```

_See code: [dist/commands/context/list.js](https://github.com/autocode2/autocode2/blob/v0.0.0-development/dist/commands/context/list.js)_

## `auto-code-cli test`

```
USAGE
  $ auto-code-cli test
```

_See code: [dist/commands/test.js](https://github.com/autocode2/autocode2/blob/v0.0.0-development/dist/commands/test.js)_

<!-- commandsstop -->
