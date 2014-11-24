/*
 * buildjs cli
 */
var FS 		= require('fs');
var PATH 	= require('path');
var EXEC 	= require('child_process').exec;

var mkdir 	= require('util-mkdir');

var buildjs = {};


// =================================================================================================
// 相关帮助
// 
// 

/**
 * @description print help information
 */
buildjs.help = function() {
	var output = "Usage: buildjs [options] [arguments] \n\nOptions:\n";
	output += buildjs.help.cmds.join('\n');
	console.log(output);
}

// commands
buildjs.help.cmds = [
	'-init [src]             初始化，[src]可指定项目源文件夹，不指定则以当前所在文件夹下的front为源文件夹',
	'-wstart [src] [conf]    启动实时文件监听，[src]可指定项目源文件夹，[conf]可指定配置文件路径',
	'-wstop [src]            停止实时文件监听, [src]可指定项目源文件夹',
	'-xgettext [lang] [conf] 提取待翻译词条, [lang]可指定语言，如：en，用\',\'隔开，默认值为en；[conf]指定配置文件路径',
	'-gettext [lang] [conf]  翻译标记的词条, [lang]可指定语言，如：en，用\',\'隔开，默认值为en；[conf]指定配置文件路径',
	'-release init [lang]    初始化编译配置文件功能，若[lang]未指定，则默认初始化为src_min目标文件夹',
	'-release [lang]         编译功能，[lang]为指定编译生成的目标文件夹（从src编译到[lang]），未指定则默认为src_min',
	'-v                      buildjs版本',
];


// =================================================================================================
// 初始化
// 
// 

/**
 * @param  {string} src 指定初始化的项目源文件夹，若为空，则以当前执行脚本的文件夹所在路径为src
 * @return {null}     null
 */
buildjs.init = function(src) {
	// 监听的项目源文件夹
	src ? null : src = process.cwd();
	var frontSrc = PATH.join(src, '__src/');
	// 默认seajs配置文件路径
	var seajsConf = PATH.join(src, 'conf');

	// 创建放置配置文件及监听pid的文件夹
	var buildDir = PATH.join(src, '__buildjs');
	mkdir(buildDir);
	
	// 生成实时监听及htpl2js的配置文件
	var monitorConfig = {
		"SRC": 		frontSrc,
		"CONFSRC": 	PATH.join(seajsConf, '__conf.js'),
		"CONFDEST": PATH.join(seajsConf, 'conf.js'),
		"JSALIAS": 	PATH.join(seajsConf, '__jsalias.json'),
		"CSSALIAS": PATH.join(seajsConf, '__cssalias.json'),
		"SYNCHROEXCLUDESRC": 	frontSrc,
		"SYNCHROEXCLUDEDEST": 	PATH.join(src, 'src'),
		"SYNCHROONLYSRC": 		PATH.join(frontSrc, 'page'),
		"SYNCHROONLYDEST": 		PATH.join(PATH.dirname(src), 'views/src'),
		"VERSION": ""
	}
	var monitorConfigPath = PATH.join(buildDir, 'CONFIG.json');
	FS.writeFileSync(monitorConfigPath, JSON.stringify(monitorConfig), 'utf8');


	// i18n配置文件
	var i18nDir = PATH.join(buildDir, 'i18n');
	var xgettextConfig = {
		"SRC": 		frontSrc,
		"DESTDIR": 	i18nDir,
		"DESTFILE": PATH.join(i18nDir, 'i18n.{lang}.po'),
		"EXIST": 	PATH.join(i18nDir, 'i18n.{lang}.po'),
		"TYPE": 	"po",
		"MERGE": 	true
	}
	FS.writeFileSync(PATH.join(buildDir, 'XGETTEXT_CONFIG.json'), JSON.stringify(xgettextConfig), 'utf8');

	var gettextConfig = {
		"I18N": 		PATH.join(i18nDir, 'i18n.{lang}.po'),
		"FRONTSRC": 	PATH.join(src, 'src'),
		"FRONTDEST": 	PATH.join(src, '{lang}'),
		"VIEWSRC": 		PATH.join(PATH.dirname(monitorConfig.SYNCHROONLYDEST), 'src'),
		"VIEWDEST": 	PATH.join(PATH.dirname(monitorConfig.SYNCHROONLYDEST), '{lang}'),
		"REPSTR": 		""
	}
	FS.writeFileSync(PATH.join(buildDir, 'GETTEXT_CONFIG.json'), JSON.stringify(gettextConfig), 'utf8');


	// 执行初始化脚本
	require('./buildjs-task/task-monitor/monitor-init.js')(monitorConfigPath, function(){
		// 执行监听
		buildjs.startMonitor();
	});
}


// =================================================================================================
// 监听机制
// 
// 

/**
 * @param  {string} src  指定需要监听的文件夹，默认是init中src下的__src文件夹
 * @param  {string} conf 指定相关配置文件，默认为init中src下新建的__buildjs文件夹下的CONFIG.json文件
 * @return {null}      null
 */
buildjs.startMonitor = function(src, conf){
	src ? null : src = PATH.join(process.cwd(), '__src/');
	conf ? null : conf = PATH.join(process.cwd(), '__buildjs', 'CONFIG.json');
	var mstart = require('./buildjs-task/task-monitor/monitor-start.js');
	var execRoot = PATH.join(__dirname, 'buildjs-task', 'task-monitor');

	// 先停止监听
	buildjs.stopMonitor(src);

	// alias-conf
	mstart(PATH.join(PATH.dirname(src), 'conf'), PATH.join(execRoot, 'run-mconf.js'), conf, PATH.join(process.cwd(), '__buildjs', 'mconf.log'));
	// rsync
	mstart(src, PATH.join(execRoot, 'run-mrsync.js'), conf, PATH.join(process.cwd(), '__buildjs', 'mrsync.log'));
}


/**
 * @param  {string} src 默认为当前执行脚本的文件夹下的__buildjs文件夹
 * @return {null}     null
 */
buildjs.stopMonitor = function(src){
	src ? null : src = PATH.join(process.cwd(), '__buildjs');
	require('./buildjs-task/task-monitor/monitor-stop.js')(src);
}




// =================================================================================================
// 国际化
// 
// 

buildjs.xgettext = function(lang, conf){
	lang ? null : lang = 'en';
	conf ? null : conf = PATH.join(process.cwd(), '__buildjs', 'XGETTEXT_CONFIG.json');
	require('./buildjs-task/task-i18n/i18n-xgettext.js')(lang, conf);
}



buildjs.gettext = function(lang, conf){
	lang ? null : lang = 'en';
	conf ? null : conf = PATH.join(process.cwd(), '__buildjs', 'GETTEXT_CONFIG.json');
	require('./buildjs-task/task-i18n/i18n-gettext.js')(lang, conf);
}




// =================================================================================================
// 编译
// 
// 
buildjs.release = function(arg1, arg2){
	var src = process.cwd();
	if(arg1 === 'init'){
		arg2 ? null : arg2 = 'src_min';

		var tmpPath = PATH.join(src, 'src_tmp');
		var destPath = PATH.join(src, arg2);

		var config = {
			"CSSMINSRC": 	PATH.join(src, 'src'),
			"CSSMINDEST": 	tmpPath,
			"CSSMINBASE": 	'/front/' + arg2,
			"TRANSPORTSRC": tmpPath,
			"TRANSPORTDEST":destPath,
			"UGLIFYSRC": 	[PATH.join(destPath, 'page'), PATH.join(destPath, 'widget')],
			"UGLIFYBASE": 	destPath,
			"ALIAS": 		PATH.join(src, 'conf', '__jsalias.json'),
			"IGNORE": 		PATH.join(src, 'conf', '__ignore.json'),
			"GRUNTJS": 		PATH.join(__dirname, 'node_modules', 'gruntjs')
		};
		FS.writeFileSync(PATH.join(src, '__buildjs', 'RELEASE_CONFIG_' + arg2 + '.json'), JSON.stringify(config), 'utf8');
	}else{
		arg1 ? null : arg1 = 'src_min';
		var conf = PATH.join(src, '__buildjs', 'RELEASE_CONFIG_' + arg1 + '.json');
		if(!FS.existsSync(conf)){
			buildjs.release('init', arg1);
		}
		require('./buildjs-task/task-release/build-release.js')(conf);
	}
}




// =================================================================================================
// 版本号
// 
// 
buildjs.version = function(){
	var json = require('./package.json');
	console.log('Version: ' + json.version);
}



// =================================================================================================
// 运行时
// 
// 

/**
 * @param  {array} argv 传入的参数
 */
buildjs.run = function(argv) {
	if (argv.length < 3) {
		console.log('try buildjs -h to get help for buildjs.');
		return;
	}

	switch (argv[2]) {
		case '-init':
			buildjs.init(argv[3]);
			break;
		case '-wstart':
			buildjs.startMonitor(argv[3], argv[4]);
			break;
		case '-wstop':
			buildjs.stopMonitor(argv[3]);
			break;
		case '-xgettext':
			buildjs.xgettext(argv[3], argv[4]);
			break;
		case '-gettext':
			buildjs.gettext(argv[3], argv[4]);
			break;
		case '-release':
			buildjs.release(argv[3], argv[4])
			break;
		case '-v':
			buildjs.version();
			break;
		case '-h':
			buildjs.help();
			break;
		default:
			console.log('try buildjs -h to get help for buildjs.');
			break;
	}
}


module.exports = buildjs;