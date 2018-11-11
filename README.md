# Fuller

## Build everything with right tool

_Richard Buckminster "Bucky" Fuller was an American systems theorist, architect, engineer, author, designer, inventor, and futurist_

## Install

    npm install fuller -g

## Usage

    fuller [-w] [-z] [-v] [--src] [--dst] [--taskName]

```
--watch, -w     Watch source directory for changes
--src           Relative path to directory with source files
--dst           Relative path to directory for compiled files
--verbose, -v   Verbose mode
--taskName      Run task from plan
```

## Plan

Plan is a simple js file which contains Fuller declarative config (`plan.js` by default):

```js
module.exports = {
    options,
    "task:default": {
        "beltname": beltTasks
    },

    "belt:beltname": {
        options,
        tools: [ ... ]
    }
}
```

### Belt
Belt represents a chain of tools. Take a look at belt definition example:

```js
"belt:js": {
    options: {
        src: "js",
        dst: "js"
    },

    tools: [ 'src-rollup', 'buble', 'uglify', 'buster', 'dst-file' ]
}
```

Belt definition starts with "belt" keyword and ends with belt name - `belt:name` - in the given example belt is created with `js` name.
`options` is reserved property name - it may contain options that extend default plan's one - in out case default plan source and destination folders' paths are concatenated with belt's - files will be read from 'source/js/' folder and written to 'destination/js/' folder.

### Tool
Tool is a plugin that does something with provided data. In belt tools may be run in chain and next tool will receive result of previous one's work or they can work parallel.

Options may contain described above information or any additional settings supported by tool.

### Task
Task definition starts with `task` keyword. Task is a declarative description of what should be done. Task may be function or an object or anythings - check the tool docs for details on task look.

If no task was specified on Fuller run `default` one will be used.

### Options ###
You can specify default options in global section, or in tool's part of the plan. Options declared in tools extend root options, source and destination paths are concatenated.

Don't forget about verbose mode here if you need it.

The fuller variable in your task function is a pointer to global fuller object.

© velocityzen
