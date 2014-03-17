# Carcass Monitor

A simple wrap of [forever-monitor](https://github.com/nodejitsu/forever-monitor), in Carcass style.

Requires [Carcass](https://github.com/devo-ps/carcass) >= 0.9.0; you need to manually include in your dependencies.

This is only meant to be used in tests where you need to start and stop some scripts easily. For production, use [forever](https://github.com/nodejitsu/forever) or equivalent.

## Quick Example

In a Mocha test:

```js
var Monitor = require('carcass-monitor');

describe('Something:', function() {
    var monitor = new Monitor();

    before(function(done) {
        /**
         * Each stack will be started with an instance of forever Monitor, in
         *   the syntax of:
         *
         * `new forever.Monitor('something', {...other_options...});`
         */
        monitor.stack({
            script: 'something',
            sourceDir: 'somewhere',
            options: ['some', 'options']
        }).stack(...).start(done);
    });

    after(function(done) {
        monitor.close(done);
    });

    ...
});
```

## APIs

### Instantiate

`var monitor = new Monitor([id])`

ID is optional; defaults to a random string.

### Add an item

`monitor.stack(options)`

Returns the monitor itself so it's chain-able. `options` is an object and will be used to instantiate a `forever.Monitor`, with `options.script` as the first argument, and the others as the second. See forever-monitor's [document](https://github.com/nodejitsu/forever-monitor#usage) for details.

Can be used multiple times to add multiple items.

### Start

`monitor.start(done)`

Starts all the items; returns the monitor itself.

### Close

`monitor.close(done)`

Closes (stops) all the items; returns the monitor itself.
