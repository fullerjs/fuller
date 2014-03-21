"use strict";
var inherits = require('util').inherits;
var Transform = require('stream').Transform;

var Capacitor = function(collect, cb) {
	Transform.call(this);

	this.collect = collect;
	this.cb = cb;
	this.inputBuffer = [];
};
inherits(Capacitor, Transform);

Capacitor.prototype._transform = function(chunk, encoding, cb) {
	if(this.collect) {
		this.inputBuffer.push(chunk);
		cb();
	} else {
		cb(null, chunk);
	}
};

Capacitor.prototype._flush = function(cb) {
	var self = this;
	if(this.collect) {
		this.cb(this.inputBuffer.join(''), function(err, result) {
			self.push(result);
			cb(err, result);
		});
	} else {
		cb();
	}
};

module.exports = Capacitor;
