var winston = require('winston');
var mkdirp = require('mkdirp');
var util = require('util');
var https = require('https');
var http = require('http');

mkdirp.sync('logs');
winston.level = 'silly';

var CustomLogger = winston.transports.CustomLogger = function(options) {
   this.name = 'CustomHttpLogger';
   this.level = options.level || 'info';

   this.options = options || {};
   this.options.host = options.host || '127.0.0.1';
   this.options.port = options.port || '80';
}

util.inherits(CustomLogger, winston.Transport);

CustomLogger.prototype.log = function(level, msg, meta, callback) {
    var msg = {
	nodeId: 'nodeId',
	message: msg,
	level: level,
	timestamp: Date.now()
    }
    
    this._request(this.options, msg, function(err, res) {
	if (res && res.statusCode !== 200) {
	    err = new Error('HTTP Status Code: ' + res.statusCode);
        }

	if (err) return callback(err);
	self.emit('logged');

	if (callback) callback(null, true);
    });
}

CustomLogger.prototype._request = function(options, msg, callback) {
    msg = msg || {}
    path = options.path || ''
    
    delete options.path
    req = (this.ssl ? https : http).request({
	host: options.host,
	port: options.port,
	path: '/' + path.replace(/^\//, ''),
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
    });

    req.on('error', callback);
    req.on('response', function (res) {
	res.on('end', function () {
	    callback(null, res);
	});
	
	res.resume();
    });

    req.end(new Buffer(JSON.stringify(msg), 'utf8'));
}

var logger = new (winston.Logger)({
    transports: [
	new (CustomLogger)({
	    port: 8085,
	    host: 'localhost',
	})
    ]
});

module.exports = logger;
