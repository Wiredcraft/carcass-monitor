var debug = require('debug')('carcass:test');

setTimeout(function() {
    debug('dolor');
    if (process && process.send) {
        process.send({
            started: true
        });
    }
}, 3);
