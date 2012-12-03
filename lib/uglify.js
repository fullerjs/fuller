"use strict";
var fs = require('fs');
var uglyfyJS = require('uglify-js');
var parser = uglyfyJS.parser;
var uglifier = uglyfyJS.uglify;

var FILE_ENCODING = 'utf-8';

function uglify(src, dst) {
	if(dst === undefined) {
		dst = src;
	}
    var ast = parser.parse( fs.readFileSync(src, FILE_ENCODING) );

    ast = uglifier.ast_mangle(ast);
    ast = uglifier.ast_squeeze(ast);

    fs.writeFileSync(dst, uglifier.gen_code(ast), FILE_ENCODING);
}

module.exports = {
    uglify: uglify
};
