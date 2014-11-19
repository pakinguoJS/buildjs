module.exports = function(conf){
	var CONFIG = require(conf);
	require('htpl2js')(CONFIG.SYNCHROEXCLUDESRC, CONFIG.SYNCHROEXCLUDEDEST);
}