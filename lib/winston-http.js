'use strict';

var logger = require('./logger.js')('node-server');

console.log('trying to log info');
logger.info("hello info");

console.log('trying to log warning');
logger.warn("hello warn");

console.log('trying to log error');
logger.error("hello error");


var logger2 = require('./logger.js')('foobar');
logger2.info("hello info");
logger2.warn("hello warn");

