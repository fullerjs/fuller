'use strict';
var extend = require('ops').applyDefaults;
var path = require('path');

var rxReserved = new RegExp(["belt:", "tools", "options", "dev"].join("|"));

var extendOptions = function(newOps, oldOps) {
	if(newOps) {
			if(newOps.src) {
				newOps.src = path.join(oldOps.src, newOps.src);
			}

			if(newOps.dst) {
				newOps.dst = path.join(oldOps.dst, newOps.dst);
			}
		}

	return extend(newOps, oldOps);
};

module.exports = {
	rxReserved: rxReserved,
	extendOptions: extendOptions
};
