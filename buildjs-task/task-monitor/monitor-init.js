var PATH = require('path');

module.exports = function(config, callback) {
	var mconf = require(PATH.join(__dirname, 'monitor-conf.js'));
	var mrsync = require(PATH.join(__dirname, 'monitor-rsync.js'));
	var mhtpl = require(PATH.join(__dirname, 'monitor-htpl.js'));
	mconf(config);
	mrsync(config, function(){
		mhtpl(config);
		typeof callback === 'function' ? callback() : null;
	});
}