// 执行的命令： node run-mrsync.js conf $DIR $FILE $EVENT
var synchronize = require('synchronize-files');
var htpl2js		= require('htpl2js');

var argv = process.argv;

var _HTPL   = /\.htpl$/;
var _TPL    = /\.tpl$/;
var _ATPL   = /\.(htpl|tpl)$/;

var CONFIG = require(argv[2]);

// 功能：同步文件
!_ATPL.test(argv[4]) ? synchronize.compareExcludeRsync(CONFIG.SYNCHROEXCLUDESRC, CONFIG.SYNCHROEXCLUDEDEST) : null;
_TPL.test(argv[4]) ? synchronize.compareOnly(CONFIG.SYNCHROONLYSRC, CONFIG.SYNCHROONLYDEST) : null;

// 功能：将指定文件类型，如.htpl转化为Seajs模块
_HTPL.test(argv[4]) ? htpl2js(CONFIG.SYNCHROEXCLUDESRC, CONFIG.SYNCHROEXCLUDEDEST) : null;