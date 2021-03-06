debug = require('debug')('carcass:monitor')

carcass = require('carcass')
highland = carcass.highland
ForeverMonitor = require('forever-monitor').Monitor
_ = require('lodash')

###*
 * Monitor.
###
module.exports = class Monitor
    ###*
     * Constructor.
    ###
    constructor: (options) ->
        @id(options)
        debug('initializing the %s monitor.', @id())
        @children = []

    ###*
     * A stack of items that can be used by startOne().
     *
     * @type {Function}
    ###
    stack: carcass.helpers.stacker('_stack')

    ###*
     * Start the monitor(s).
    ###
    start: (done = ->) ->
        done = _.once(done)
        cb = highland.wrapCallback(startOne)
        highland(@stack()).flatMap(cb).stopOnError(done).once('end', done).each((child) =>
            @children.push(child)
        )
        return @

    ###*
     * Close the monitor(s).
    ###
    close: (done = ->) ->
        cb = highland.wrapCallback(closeOne)
        @children.shiftToStream().flatMap(cb).errors(debug).once('end', done).resume()
        return @

###*
 * Mixins.
###
carcass.mixable(Monitor)
Monitor::mixin(carcass.proto.uid)

###*
 * Start one item.
###
startOne = (item, done) ->
    # TODO: inherit env?
    # debug('process.env', process.env)
    child = new ForeverMonitor(item.script, _.merge({
        max: 1,
        fork: true
    }, item))
    child.on('error', done)
    if item.startupMessage?
        # Wait for a startup message and unsubscribe the listener.
        onMsg = (msg) ->
            if msg?[item.startupMessage]?
                debug('received startup message: %s', item.startupMessage)
                child.removeListener('message', onMsg)
                done(null, child)
        child.on('message', onMsg)
     else
        child.once('start', -> done(null, child))
    child.start()

###*
 * Close one item.
###
closeOne = (child, done) ->
    # debug('child', child)
    return done() if not child.running
    child.on('exit', -> done())
    child.stop()
