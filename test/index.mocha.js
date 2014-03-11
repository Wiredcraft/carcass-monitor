// var debug = require('debug')('carcass:test');
// var should = require('should');
var path = require('path');
var _dir = path.resolve(__dirname, 'fixture');

var Monitor = require('../');
var monitor = null;

describe('Carcass Monitor:', function() {

    it('should be a class', function() {
        Monitor.should.be.type('function');
        (new Monitor()).should.be.type('object');
    });

    describe('An instance:', function() {

        before(function() {
            monitor = new Monitor();
        });

        it('should be an object', function() {
            monitor.should.be.type('object');
        });

        it('should be mixable', function() {
            monitor.should.have.property('mixin');
            monitor.mixin.should.be.type('function');
        });

        it('should be a stack', function() {
            monitor.should.have.property('stack');
        });
    });

    describe('Run a script exits itself:', function() {

        before(function() {
            monitor = new Monitor();
        });

        it('can start', function(done) {
            monitor.stack({
                sourceDir: _dir,
                script: 'lorem.js'
            }).start(done);
        });

        it('waits for a moment', function(done) {
            setTimeout(done, 99);
        });

        it('should have one child', function() {
            monitor.should.have.property('children').with.lengthOf(1);
        });

        it('can close', function(done) {
            monitor.close(done);
        });

        it('should have no child', function() {
            monitor.should.have.property('children').with.lengthOf(0);
        });

        it('can start again', function(done) {
            monitor.start(done);
        });

        it('waits for a moment', function(done) {
            setTimeout(done, 99);
        });

        it('should have one child', function() {
            monitor.should.have.property('children').with.lengthOf(1);
        });

        it('can close again', function(done) {
            monitor.close(done);
        });

        it('should have no child', function() {
            monitor.should.have.property('children').with.lengthOf(0);
        });
    });

    describe('Run a script does not exit:', function() {

        before(function() {
            monitor = new Monitor();
        });

        it('can start', function(done) {
            monitor.stack({
                sourceDir: _dir,
                script: 'ipsum.js'
            }).start(done);
        });

        it('waits for a moment', function(done) {
            setTimeout(done, 99);
        });

        it('should have one child', function() {
            monitor.should.have.property('children').with.lengthOf(1);
        });

        it('can close', function(done) {
            monitor.close(done);
        });

        it('should have no child', function() {
            monitor.should.have.property('children').with.lengthOf(0);
        });
    });

    describe('Run a script sends a startup message:', function() {

        before(function() {
            monitor = new Monitor();
        });

        it('can start', function(done) {
            monitor.stack({
                sourceDir: _dir,
                script: 'dolor.js',
                startupMessage: 'started'
            }).start(done);
        });

        it('should have one child', function() {
            monitor.should.have.property('children').with.lengthOf(1);
        });

        it('can close', function(done) {
            monitor.close(done);
        });

        it('should have no child', function() {
            monitor.should.have.property('children').with.lengthOf(0);
        });
    });

    describe('Run a script does not exist:', function() {

        before(function() {
            monitor = new Monitor();
        });

        it('can handle the error', function(done) {
            monitor.stack({
                sourceDir: _dir,
                script: 'wrong_file'
            }).start(function(err) {
                err.should.be.instanceOf(Error);
                done();
            });
        });

        it('should have no child', function() {
            monitor.should.have.property('children').with.lengthOf(0);
        });

        it('can close', function(done) {
            monitor.close(done);
        });

        it('should have no child', function() {
            monitor.should.have.property('children').with.lengthOf(0);
        });
    });

    describe('Run multiple scripts:', function() {

        before(function() {
            monitor = new Monitor();
        });

        it('can start', function(done) {
            monitor.stack({
                sourceDir: _dir,
                script: 'lorem.js'
            }).stack({
                sourceDir: _dir,
                script: 'ipsum.js'
            }).start(done);
        });

        it('waits for a moment', function(done) {
            setTimeout(done, 99);
        });

        it('should have two children', function() {
            monitor.should.have.property('children').with.lengthOf(2);
        });

        it('can close', function(done) {
            monitor.close(done);
        });

        it('should have no child', function() {
            monitor.should.have.property('children').with.lengthOf(0);
        });
    });
});
