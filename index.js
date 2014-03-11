var ForeverMonitor, Monitor, carcass, closeOne, debug, startOne, _;

debug = require('debug')('carcass:monitor');

_ = require('highland');

require('highland-array');

carcass = require('carcass');

ForeverMonitor = require('forever-monitor').Monitor;


/**
 * Monitor.
 */

module.exports = Monitor = (function() {
  function Monitor() {
    this.initialize.apply(this, arguments);
  }

  return Monitor;

})();

carcass.mixable(Monitor);

Monitor.prototype.mixin(carcass.proto.uid);

Monitor.prototype.mixin(carcass.proto.stack);

Monitor.prototype.initialize = function(options) {
  this.id(options);
  debug('initializing monitor %s.', this.id());
  this.children = [];
  return this;
};


/**
 * Start the monitor(s).
 */

Monitor.prototype.start = function(done) {
  var cb, returned, _done;
  if (done == null) {
    done = function() {};
  }
  cb = _.wrapCallback(startOne);
  returned = false;
  _done = function() {
    if (returned) {
      return;
    }
    returned = true;
    return done.apply(null, arguments);
  };
  _(this.stack()).flatMap(cb).stopOnError(_done).once('end', _done).each((function(_this) {
    return function(child) {
      return _this.children.push(child);
    };
  })(this));
  return this;
};


/**
 * Close the monitor(s).
 */

Monitor.prototype.close = function(done) {
  var cb;
  if (done == null) {
    done = function() {};
  }
  cb = _.wrapCallback(closeOne);
  this.children.shiftToStream().flatMap(cb).errors(debug).once('end', done).resume();
  return this;
};


/**
 * Start one item.
 */

startOne = function(item, done) {
  var child, onMsg;
  child = new ForeverMonitor(item.script, carcass.Object.extend({
    max: 1,
    fork: true
  }, item));
  child.on('error', done);
  if (item.startupMessage != null) {
    onMsg = function(msg) {
      if ((msg != null ? msg[item.startupMessage] : void 0) != null) {
        debug('received startup message: %s', item.startupMessage);
        child.removeListener('message', onMsg);
        return done(null, child);
      }
    };
    child.on('message', onMsg);
  } else {
    child.once('start', function() {
      return done(null, child);
    });
  }
  return child.start();
};


/**
 * Close one item.
 */

closeOne = function(child, done) {
  if (!child.running) {
    return done();
  }
  child.on('exit', function() {
    return done();
  });
  return child.stop();
};