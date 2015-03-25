"use strict";

var co = require('co');
var util = require('util');
var stream = require('stream');

util.inherits(Lighthouse, stream.Transform);

function Lighthouse() {
	stream.Transform.call(this);

	this.iteration = 0;
	this.handlers = {};
}

Lighthouse.prototype._flush = function(callback) {
	this.closed = true;
	callback();
};

Lighthouse.prototype._transform = function(chunk, enc, callback) {
	var self = this;
	var handlers = [];
	var result = [];
	//Save and increment iteration so we stop emitting data if new input got processed
	var iteration = ++this.iteration;

	//Remove newline and extract potential identifier
	var data = chunk.toString().slice(0, -1);
	var identifier = data.split(/\s+/)[0];

	//Reset output and exit if we have no input
	self.output([]);
	if(data.length === 0) {
		callback();
		return;
	}

	if(identifier[0] === ':') {
		//We have an identifier ':something' so we need to get the correct handlers and data
		handlers = this.handlers[identifier.substr(1)] || [];
		data = data.replace(/:\S*\s*/, '');
	} else {
		//No identifier so get all handlers
		for(let id in this.handlers) {
			handlers = handlers.concat(this.handlers[id]);
		}
	}

	co(function *() {
		//Run over each handler and add to results array once done
		yield handlers.map(function(handler) {
			return function *() {
				var res = yield handler(data, identifier[0] === ':');
				if(typeof res === 'object') {
					if(!Array.isArray(res)) res = [res];
					result.push.apply(result, res);

					//if iterations dont match, do nothing, because we had input in between
					if(iteration === self.iteration) self.output(result);
				}
			};
		});
	}).then(undefined, function(err) {
		console.error(err.stack);
	});

	//Call the callback immediately, so we keep retrieving new input
	callback();
};

Lighthouse.prototype.output = function(data) {
	if(this.closed) return;

	this.push(data.map(function encode(entry) {
		var e = Lighthouse.escape;
		
		var icon = entry.icon ? ('%I' + e(entry.icon) + '%') : '';
		var title = e(entry.title);
		var action = e(entry.action);

		return '{ ' + icon + title + ' | ' + action + ' }';
	}).join('') + '\n');
};

Lighthouse.prototype.attach = function(name, handler) {
	if(!handler) {
		handler = name;
		name = ':';
	}

	this.handlers[name] = this.handlers[name] || [];
	this.handlers[name].push(handler);
};

Lighthouse.escape = function(str) {
	return str.replace(/[\%\|&;<>\(\)\{}\\]/g, '\\$&');
};

module.exports = Lighthouse;