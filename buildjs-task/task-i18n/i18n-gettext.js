module.exports = function(lang, conf){
	var i18n = require('i18n-gettext');
	lang = lang.split(',');
	var CONFIG = require(conf);
	lang.forEach(function(itm){
		i18n.gettext(CONFIG.I18N.replace('{lang}', itm), CONFIG.FRONTSRC, CONFIG.FRONTDEST.replace('{lang}', itm));
		i18n.gettext(CONFIG.I18N.replace('{lang}', itm), CONFIG.VIEWSRC, CONFIG.VIEWDEST.replace('{lang}', itm));
	});
}