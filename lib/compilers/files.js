"use strict";

var fs = require('fs');
var path = require('path');

var FILE_ENCODING = 'utf-8',
    EOL = '\n';

var concat = function (srcPath, src, prepend, append) {
    var out = src.map(function(filePath){
        return (prepend || '') + fs.readFileSync( path.join(srcPath, filePath), FILE_ENCODING) + (append || '');
    });

    return out.join(EOL);
};

module.exports = {
    concat: concat
};
