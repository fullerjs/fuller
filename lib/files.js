"use strict";

var fs = require('fs');
var path = require('path');

var FILE_ENCODING = 'utf-8',
    EOL = '\n';

var concat = function (srcPath, src, dst, prepend, append) {
    var out = src.map(function(filePath){
            return fs.readFileSync( path.join(srcPath, filePath), FILE_ENCODING);
        });

    if(prepend) {
		out.splice(0, 0, prepend);
    }

    if(append) {
		out.push(append);
    }

    fs.writeFileSync(dst, out.join(EOL), FILE_ENCODING);
};

module.exports = {
    concat: concat
};
