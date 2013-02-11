"use strict";

var formatNum = function (num) {
	return num < 10 ? '0' + num : '' + num;
};

var getDate = function () {
	var d = new Date();
	return formatNum(d.getHours()) + ':' + formatNum(d.getMinutes()) + ':' + formatNum(d.getSeconds()) + ' ' + formatNum(d.getDate()) +
	'/' + formatNum(d.getMonth() + 1) + '/' + d.getFullYear();
};

var Verbose = function(verbose) {
	this.v = verbose;
};

Verbose.prototype.log = function(str) {
	this.v && console.log('['+getDate()+']', str);
};


module.exports = Verbose;
