lighthouse-provider
===================
[![Build Status](https://img.shields.io/travis/paulavery/node-lighthouse-provider.svg?style=flat)](https://travis-ci.org/paulavery/node-lighthouse-provider)

This module provides a way to easily define providers for menu entries to the [lighthouse](https://github.com/emgram769/lighthouse) launcher. It depends on generators, so run node with the `--harmony` flag (or use io.js).

Quickstart
----------
**lighthouse.js:**

	#!/usr/bin/env node
	var Lighthouse = require('lighthouse-provider');
	var lighthouse = new Lighthouse();

	lighthouse.attach(function *(input) {
		return {
			icon: '/some/path/to/icon.png',
			title: 'Execute [' + input + ']',
			action: input
		};
	});

	process.stdin.pipe(lighthouse).pipe(process.stdout);

You may now use this file as a cmd file for lighthouse.

API
---
Once you created a provider instance via

	var lighthouse = new Lighthouse();

You can use it as a duplex stream:

	process.stdin.pipe(lighthouse).pipe(process.stdout);

### lighthouse.attach(identifier, handler)
This function allows you to provide a generator function for asynchronous data retrieval (will be run through [co](https://github.com/tj/co)).

#### Identifier
The identifier parameter is optional and may be used, to filter for specific handlers.

So if your input to lighthouse looks like `:someId actual input`, only the handlers with the identifier `someId` will be called. If no identifier is provided, it is set to `:`.

#### Handler Function
The handler function will be called with whatever the user types into lighthouse (minus the identifier).
As a second argument, it is provided a boolean signifying if the handlers flag was supplied.
Your function may then do whatever it likes with it, retrieve data from the web, a file system or simply reformat the input etc.

Once done, simply return an object of the form:

	{
		icon: '/some/path/to/icon.png',
		title: 'Execute [' + input + ']',
		action: input
	}

The `icon` property may be omitted, but `title` and `action` are required. `lighthouse-provider` will then take care of escaping and formatting the output for you.

If you return anything but an object, your handler will not be output.


lighthouse-provider-common
--------------------------
You may want to check out the [lighthouse-provider-common](https://github.com/paulavery/node-lighthouse-provider-common) module, for some useful providers.