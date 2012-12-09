# Fuller #
## Build utility for browser's stuff written on nodejs ##

_Richard Buckminster "Bucky" Fuller was an American systems theorist, architect, engineer, author, designer, inventor, and futurist_

## Install ##
    npm install fuller -g

## Usage ##
    fuller [-p plan.json] [-w] [-s] [-d] [-j] [-c] [-z] [-v]

```
--plan, -p  Plan file name (plan.json by default)
--watch, -w Watch source directory for changes
--src, -s   Relative path to directory with source files
--dst, -d   Relative path to directory for compiled files
--js, -j    Compile js only
--css, -c   Compile css only
--dev, -z   Developer version (no minifing and compressions)
--verbose, -v   Verbose mode
```
## Plan ##
So Fuller needs a plan, and here it is, simple json:
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
### Global ###
You can specify default option in global section, and overide them with command line.

### Js ###
    todo

### Less ###
    todo

