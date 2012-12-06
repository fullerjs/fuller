# Fuller #
## Build utility for browser's stuff written on nodejs ##

_Richard Buckminster "Bucky" Fuller was an American systems theorist, architect, engineer, author, designer, inventor, and futurist_

## Install ##
    npm install fuller -g

## Usage ##
    fuller [-p plan.json] [-j] [-c] [-d] [-v]

```
--plan, -p  Plan file name (plan.json by default)
--js, -j    Compile js only
--css, -c   Compile css only
--dev, -d   Developer version (no minifing and compressions)
--verbose, -v   Verbose mode
```
## Plan ##
So Fuller needs a plan, and it is simple json:
```json
{
    "global": {
        "src": "./src",
        "dst": "./static",
        "dev": true
    },

    "js": {
        "out/script.js": {
            "lib": "jQuery",
            "src": ["src.js"]
        },

        "out/script.js": {
            "lib": "jQuery",
            "src": [
                "src1.js",
                "src2.js"
            ]
        },

        "out/script.js": [
            "src1.js",
            "src2.js"
        ]
    },

    "less": {
        "out.css": "src.less",
    }
}
```
You can specify default option in global section, and overide them with command line.

### Global ###
    src: relative path to directory with source files
    dst: relative path to directory where we will build
    js:  compile js only
    css: compile css only
    dev: developer version (no minifing and compressions)
    verbose: verbose mode

### Js ###
    todo

### Less ###
    todo

