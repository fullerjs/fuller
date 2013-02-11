"use strict";
var inspect = require('util').inspect;

var errReport = function(cb) {
	return function(err, result) {
		if(err) {
			console.log(inspect(err));
		} else {
			cb && cb(null, result);
		}
	};
};

module.exports = {
	errReport: errReport
};
