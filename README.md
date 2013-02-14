# Fuller #
## Build utility for browser's stuff written on nodejs ##

_Richard Buckminster "Bucky" Fuller was an American systems theorist, architect, engineer, author, designer, inventor, and futurist_

## Install ##
    npm install fuller -g

## Usage ##
    fuller [-w] [-src] [-dst] [-j] [-s] [-c] [-z] [-v]

```
--watch, -w Watch source directory for changes
--src       Relative path to directory with source files
--dst       Relative path to directory for compiled files
--js, -j    Compile js only
--css, -s   Compile css only
--dev, -z   Developer version (no minifing and compressions)
--compile, -c   Compile js with closure compiler
--verbose, -v   Verbose mode
```
## Plan ##
So Fuller needs a plan, it is a simple node module:
```js
var defaults = {
    src: "./src",
    dst: "./static",
    dev: true
};

var js = {
    "out/script.js": [
        "src1.js",
        "src2.js"
    ]
};

var less = {
        "out.css": "src.less"
};

var tasks = {
    //look for further explanation in the text below
}

module.exports = {
    defaults: defaults,
    tasks: tasks,
    js: js,
    less: less
};
```
### Defaults ###
You can specify default option in global section, and overide them with command line.

## CommonJS ##
Fuller has his own tiny and deadly simple commonJS (nodejs like) module realization. It consists from just two functions _require_ and _exports_. You can write your client js like usual nodejs module.

```js
    var a = require('a');
    var b = function () {

    }
    exports('b', b);
``` 

Fuller will wrap all, app and each module, in closures. So your modules will be availible only for your app. If you need to make your module global (to be avalible outside your app), just use 
```js
    exports('b', b, true);
```
## Tasks
You can specify your own tasks in plan:
```js
tasks = {
    start: function(fuller) {
        fuller.build();             //build all js and/or less
        fuller.run('bin/cmd start') //run cmd
    }
}
```
and then just run it
    fuller --start

Don't forget about verbose mode here if you needed.

The fuller var in your task function is a pointer to global fuller object.

__fuller.plan__ — your plan

__fuller.build()__ — build all your js/styles from plan

__fuller.watch()__ — watch for changes in all your js/styles from plan and recompile it.

__fuller.run(cmd)__ — run cmd

Verbose mode:

__fuller.verbose.log(str)__ — print str to console if fuller in verbose mode

Several help functions:

__fuller.concat(path, arrayFileNames, [prependString], [appendString])__ — concatenates files with base path and strings for appeding and prepending to result.

__fuller.writeFileForce(pathFile, data, cb)__ — writes file, but if destination directory not exist creates it.

Bonus, you can specify dev task. It'll be run before all others tasks when you'll use -z(--dev) key.
