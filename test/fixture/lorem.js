var debug = require('debug')('carcass:test');

setTimeout(function() {
    debug('lorem');
    process.exit();
}, 3);
