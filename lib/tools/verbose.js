"use strict";
const chalk = require("chalk");

let formatNum = function (num) {
	return num < 10 ? "0" + num : "" + num;
};

let getDate = function () {
	let d = new Date();
	return formatNum(d.getHours()) + ":" + formatNum(d.getMinutes()) + ":" + formatNum(d.getSeconds());
};

let Verbose = function(verbose) {
	this.v = verbose;
};

Verbose.prototype.log = function() {
	this.v && console.log(`[${ getDate() }]`, Array.prototype.slice.call(arguments).join(" "));
};

Verbose.prototype.error = function(err) {
	let msg;

	if(typeof err === "object") {
		msg = `${ err.message }\n\t   ` + chalk.red(`${ err.line }:${ err.column } `) + err.file;
		if(err.extract) {
			msg += chalk.grey(`\n${err.extract}`);
		}
	} else {
		msg = Array.prototype.slice.call(arguments).join("\n");
	}

	console.log(`[${ getDate() }]`, chalk.red("Error:"), msg);
};

module.exports = Verbose;
