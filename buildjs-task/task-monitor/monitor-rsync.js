module.exports = function(conf, callback){
	var CONFIG = require(conf);
	var synchronize = require('synchronize-files');
	synchronize.compareExcludeRsync(CONFIG.SYNCHROEXCLUDESRC, CONFIG.SYNCHROEXCLUDEDEST, 'view', callback);
	synchronize.compareOnly(CONFIG.SYNCHROONLYSRC, CONFIG.SYNCHROONLYDEST);
}