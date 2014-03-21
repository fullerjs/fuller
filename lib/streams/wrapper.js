"use strict";
var inherits = require('util').inherits;
var Transform = require('stream').Transform;

var Wrapper = function(options) {
	Transform.call(this);

	var self = this;
	this.prologue = options.prologue || "";
	this.itemPrologue = options.itemPrologue || "";
	this.itemEpilogue = options.itemEpilogue || "";
	this.epilogue = options.epilogue || "";

	this.on('pipe', function(stream){
		self.push(self.prologue);
		stream
			.on('itemstart', function() {
				self.push(self.itemPrologue);
			})
			.on('itemend', function() {
				self.push(self.itemEpilogue);
			});
	});
};
inherits(Wrapper, Transform);

Wrapper.prototype._transform = function(chunk, encoding, cb) {
	cb(null, chunk);
};

Wrapper.prototype._flush = function(cb) {
	this.push(this.epilogue);
	cb();
};

module.exports = Wrapper;
