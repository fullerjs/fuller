"use strict";
var inspect = require('util').inspect;

var errReport = function() {
	return function(err, result) {
		if(err) {
			console.log(inspect(err));
		}
	};
};

module.exports = {
	errReport: errReport
};
