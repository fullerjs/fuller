"use strict";
var fs = require('fs');
var path = require('path');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var isArray = Array.isArray;

var Watchmen = function(files, options) {
	EventEmitter.call(this);

	options = options || {};
	this.interval = options.interval || 500;
	this.debounceDelay = options.debounceDelay || 500;
	this.mode = options.mode || 'auto';

	this.watching = {};

	this.add(files);
};
inherits(Watchmen, EventEmitter);

Watchmen.prototype.reset = function() {
	for(var file in this.watching) {
		fs.unwatchFile(file);
	}

	this.watching = {};
};

Watchmen.prototype.add = function(files, slave) {
	if(!isArray(files)) {
		files = [files];
	}

	var f, i;

	for(i in files) {
		f = files[i];

		if(!fs.existsSync(f)) {
			continue;
		}

		this.watchFile(f, slave);
	}
};

Watchmen.prototype.watchFile = function(file, slave) {
	var self = this;

	if(this.watching[file] === undefined) {
		this.watching[file] = [slave];

		fs.watchFile(file, {interval: this.interval}, function(curr, prev) {
			if(curr.mtime > prev.mtime) {
				self.emit("changed", file, self.watching[file]);
			}
		});
	} else if(this.watching[file].indexOf(slave) === -1) {
		this.watching[file].push(slave);
	}
};

Watchmen.prototype.watched = function() {
	return this.watching;
};


module.exports = Watchmen;
