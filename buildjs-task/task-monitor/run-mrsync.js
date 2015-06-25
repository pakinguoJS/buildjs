// 执行的命令： node run-mrsync.js conf $DIR $FILE $EVENT
var PATH = require('path');
var FS = require('fs');
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

// 功能：版本控制
require('alias-conf')(CONFIG.CONFSRC, CONFIG.CONFDEST, CONFIG.JSALIAS, CONFIG.CSSALIAS, CONFIG.VERSION ? CONFIG.VERSION : new Date().getTime());
require('version-conf')(CONFIG.VERSIONSRC, CONFIG.VERSIONDEST);

// 临时：i18n 翻译为en
// var i18n = require('i18n-gettext');
// var lang = 'en';
// var i18nConfig = require(PATH.join(PATH.dirname(argv[2]), 'GETTEXT_CONFIG.json'));
// i18n.gettext(i18nConfig.I18N.replace('{lang}', lang), i18nConfig.FRONTSRC, i18nConfig.FRONTDEST.replace('{lang}', lang));
// i18n.gettext(i18nConfig.I18N.replace('{lang}', lang), i18nConfig.VIEWSRC, i18nConfig.VIEWDEST.replace('{lang}', lang));