"use strict";

var errReport = function() {
	return function(err, result) {
		if(err) {
			console.log(err);
		}
	};
};

module.exports = {
	errReport: errReport
};
