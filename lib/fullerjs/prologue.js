;(function(window, document, undefined) {
	"use strict";
	var modules = {};

	function require (identifier) {
		var module = modules[identifier] || window[identifier];
		if (!module) {
			throw new Error("Ender Error: Requested module '" + identifier + "' has not been defined.");
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

//})(window, document);  //epilogue.js
