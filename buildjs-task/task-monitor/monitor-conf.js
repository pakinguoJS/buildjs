module.exports = function(conf){
	var CONFIG = require(conf);
	require('alias-conf')(CONFIG.CONFSRC, CONFIG.CONFDEST, CONFIG.JSALIAS, CONFIG.CSSALIAS, CONFIG.VERSION ? CONFIG.VERSION : new Date().getTime());
}