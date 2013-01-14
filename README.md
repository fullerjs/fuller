# Fuller #
## Build utility for browser's stuff written on nodejs ##

_Richard Buckminster "Bucky" Fuller was an American systems theorist, architect, engineer, author, designer, inventor, and futurist_

## Install ##
    npm install fuller -g

## Usage ##
    fuller [-p plan.js] [-w] [-src] [-dst] [-j] [-s] [-c] [-z] [-v]

```
--plan, -p  Plan file name (plan.js by default)
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
So Fuller needs a plan, and here it is, simple js:
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
}
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

