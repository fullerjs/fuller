;(function(window, document, undefined) {
	"use strict";
	var modules = {};

	function require (name) {
		var module = modules[name] || window[name];
		if (!module) {
			throw new Error("Requested module '" + name + "' has not been defined.");
		}
		return module;
	}

	function exports (name, module, global) {
		if(global) {
			window[name] = module;
		} else {
			modules[name] = module;
		}
	}

