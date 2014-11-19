// 执行的命令： node run-mconf.js conf $DIR $FILE $EVENT
var PATH = require('path');
var argv = process.argv;
var CONFIG = require(argv[2]);
if(PATH.basename(CONFIG.CONFDEST) != argv[4]){
	require('alias-conf')(CONFIG.CONFSRC, CONFIG.CONFDEST, CONFIG.JSALIAS, CONFIG.CSSALIAS, CONFIG.VERSION ? CONFIG.VERSION : new Date().getTime());
}
