module.exports = function(lang, conf){
	var i18n = require('i18n-gettext');
	lang = lang.split(',');
	var CONFIG = require(conf);
	lang.forEach(function(itm){
		i18n.xgettext(CONFIG.SRC, CONFIG.DESTDIR, CONFIG.DESTFILE.replace('{lang}', itm), CONFIG.EXIST.replace('{lang}', itm));
	});
}