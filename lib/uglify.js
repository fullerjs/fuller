"use strict";
var fs = require('fs');
var UglifyJS = require('uglify-js');
var compressor = UglifyJS.Compressor();

var FILE_ENCODING = 'utf-8';

function uglify(src, dst) {
	if(dst === undefined) {
		dst = src;
	}

    var ast = UglifyJS.parse( fs.readFileSync(src, FILE_ENCODING) );

    ast.figure_out_scope();
    ast = ast.transform(compressor);
	ast.figure_out_scope();
	ast.compute_char_frequency();
	ast.mangle_names();

    fs.writeFileSync(dst, ast.print_to_string(), FILE_ENCODING);
}

module.exports = {
    uglify: uglify
};
