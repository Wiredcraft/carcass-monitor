var ForeverMonitor, Monitor, carcass, closeOne, debug, once, startOne, _;

debug = require('debug')('carcass:monitor');

carcass = require('carcass');

_ = carcass.highland;

ForeverMonitor = require('forever-monitor').Monitor;

once = require('once');


/**
 * Monitor.
 */

module.exports = Monitor = (function() {

  /**
   * Constructor.
   */
  function Monitor(options) {
    this.id(options);
    debug('initializing the %s monitor.', this.id());
    this.children = [];
  }


  /**
   * A stack of items that can be used by startOne().
   *
   * @type {Function}
   */

  Monitor.prototype.stack = carcass.helpers.stacker('_stack');


  /**
   * Start the monitor(s).
   */

  Monitor.prototype.start = function(done) {
    var cb;
    if (done == null) {
      done = function() {};
    }
    done = once(done);
    cb = _.wrapCallback(startOne);
    _(this.stack()).flatMap(cb).stopOnError(done).once('end', done).each((function(_this) {
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

  return Monitor;

})();


/**
 * Mixins.
 */

carcass.mixable(Monitor);

Monitor.prototype.mixin(carcass.proto.uid);


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
