"use strict";
var chalk = require('chalk');

var formatNum = function (num) {
	return num < 10 ? '0' + num : '' + num;
};

var getDate = function () {
	var d = new Date();
	return formatNum(d.getHours()) + ':' + formatNum(d.getMinutes()) + ':' + formatNum(d.getSeconds());
};

var Verbose = function(verbose) {
	this.v = verbose;
};

Verbose.prototype.log = function() {
	this.v && console.log('['+getDate()+']', Array.prototype.slice.call(arguments).join(' '));
};

Verbose.prototype.error = function() {
	console.log('['+getDate()+']', chalk.red('Error:'), Array.prototype.slice.call(arguments).join(' '));
};

module.exports = Verbose;
