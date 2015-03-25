var sinon = require('sinon');
require('sinon-as-promised');

var Lighthouse = require('../index.js');

describe('A lighthouse instance', function() {
	var lighthouse = new Lighthouse();
	var stub1 = sinon.stub();
	var stub2 = sinon.stub();
	var stub3 = sinon.stub();
	var spy = sinon.spy();

	stub1.resolves({
		icon: 'Some Icon',
		title: 'Some Title',
		action: 'Some Action'
	});

	stub2.resolves({
		action: 'Some Action2',
		title: 'Some Title2'
	});

	stub3.resolves({
		action: 'Some Action3',
		title: 'Some Title3'
	});

	beforeEach(function() {
		lighthouse = new Lighthouse();
		lighthouse.attach(stub1);
		lighthouse.attach(stub2);
		lighthouse.attach('s', stub3);
		lighthouse.on('data', spy);
		
		stub1.reset();
		stub2.reset();
		stub3.reset();
		spy.reset();
	});

	describe('calls attached functions when', function() {
		it('called without an identifier', function(cb) {
			lighthouse.write('Data\n');
			setTimeout(function() {
				lighthouse.end();
			}, 0);

			lighthouse.on('error', cb);
			lighthouse.on('end', function() {
				stub1.calledOnce.must.be.true();
				stub2.calledOnce.must.be.true();
				stub3.calledOnce.must.be.true();

				stub1.calledWith('Data').must.be.true();
				stub2.calledWith('Data').must.be.true();
				stub3.calledWith('Data').must.be.true();
				cb();
			});
		});

		it('called with an identifier', function(cb) {
			lighthouse.write(':s Data\n');
			setTimeout(function() {
				lighthouse.end();
			}, 0);

			lighthouse.on('error', cb);
			lighthouse.on('end', function() {
				stub1.called.must.be.false();
				stub2.called.must.be.false();
				stub3.calledOnce.must.be.true();

				stub3.calledWith('Data').must.be.true();
				cb();
			});
		});
	});

	describe('outputs correctly when', function() {
		it('called without an identifier', function(cb) {
			lighthouse.write('Data\n');
			setTimeout(function() {
				lighthouse.end();
			}, 0);

			lighthouse.on('error', cb);
			lighthouse.on('end', function() {
				spy.firstCall.args[0].toString().must.equal('\n');
				spy.lastCall.args[0].toString().must.contain('{ %ISome Icon%Some Title | Some Action }');
				spy.lastCall.args[0].toString().must.contain('{ Some Title2 | Some Action2 }');
				spy.lastCall.args[0].toString().must.contain('{ Some Title3 | Some Action3 }');
				cb();
			});
		});

		it('called with an identifier', function(cb) {
			lighthouse.write(':s Data\n');
			setTimeout(function() {
				lighthouse.end();
			}, 0);

			lighthouse.on('error', cb);
			lighthouse.on('end', function() {
				spy.firstCall.args[0].toString().must.equal('\n');
				spy.lastCall.args[0].toString().must.not.contain('{ %ISome Icon%Some Title | Some Action }');
				spy.lastCall.args[0].toString().must.not.contain('{ Some Title2 | Some Action2 }');
				spy.lastCall.args[0].toString().must.contain('{ Some Title3 | Some Action3 }');
				cb();
			});
		});

		it('input should be escaped', function(cb) {
			var stub = sinon.stub();
			stub.resolves({
				title: 'Title %|&;<>(){}\\',
				action: 'Action %|&;<>(){}\\'
			});
			lighthouse.attach(stub);

			lighthouse.write('Data\n');
			setTimeout(function() {
				lighthouse.end();
			}, 0);

			lighthouse.on('error', cb);
			lighthouse.on('end', function() {
				spy.lastCall.args[0].toString().must.not.contain('{ Title %|&;<>(){}\\ | Action %|&;<>(){}\\ }');
				spy.lastCall.args[0].toString().must.contain('{ Title \\%\\|\\&\\;\\<\\>\\(\\)\\{\\}\\\\ | Action \\%\\|\\&\\;\\<\\>\\(\\)\\{\\}\\\\ }');
				cb();
			});
		});
	});
});