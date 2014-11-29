#Buildjs功能API
此文档为node_modules下开发的组件的功能描述文档，包括如何调用提供的函数。所有组件都基于nodejs编写，并通过package.json提供便捷的nodejs模块加载方式。（不了解nodejs模块加载机制的请参考nodejs的API：<a href="http://nodejs.org/api/modules.html#modules_modules" target="_blank">Modules</a>）

<br>
##alias-conf
用于合成seajs的前端配置文件，由3个文件合并而成：__ jsalias.json、__ cssalias.json、__conf.js

>引用方式：<br>
>var AliasConf = require('alias-conf');<br>
>AliasConf(CONFSRC, CONFDEST, JSALIAS, CSSALIAS, VERSION);

	function aliasConf(tpl, dest, jsalias, cssalias, version, jsreg, cssreg, vreg){}
	--------------------------------------------------------------------------------
	tpl			{String}		需要完善合并的模板文件
	dest		{String}		输出文件路径
	jsalias		{String}		js的alias文件路径，默认配置文件的__jsalias.json
	cssalias	{String}		css的alias文件路径，默认配置文件的__cssalias.json
	version		{String||Number}缓存（或构建）的版本号
	jsreg		{RegExp}		匹配模板文件替换jsalias文本的正则，缺省值/('|")\{seajs_alias\}('|")/
	cssreg		{RegExp}		匹配模板文件替换cssalias文本的正则，缺省值/('|")\{seacss_alias\}('|")/
	vreg		{RegExp}		匹配模板文件替换version文本的正则，缺省值/('|")\{version\}('|")/

	-----------------------------------------------
	*备注：
	tpl模板文件举例：
	// __conf.js
	;(function (seajs, seacss) {
		// Base path
		var base = '/myblog/front/' + window.lang;
	
		// Version
	    var v = true ? new Date().getTime() : '{version}';
	
		// JS files config
		seajs.config({
			base: base,
			alias: '{seajs_alias}',
			preload: [],
			map: [
				[/\.js$/, '.js?v=' + v],
				[/\.css$/, '.css?v=' + v]
			],
			debug: false
		});
	
		// CSS files config
		seacss.config({
			base: base,
			alias: '{seacss_alias}',
			preload: ['bootstrap'],
			map: [
				[/\.css$/, '.css?v=' + v]
			],
			debug: false
		});
	})(seajs, seacss);
	

<br>
##synchronize-files
用于同步静态资源文件和view层页面模板文件。

>引用方式：<br>
>var Synchronize = require('synchronize-files');<br>
>Synchronize.compareExcludeRsync(SYNCHROEXCLUDESRC, SYNCHROEXCLUDEDEST, 'view', callback);<br>
>Synchronize.compareOnly(SYNCHROONLYSRC, SYNCHROONLYDEST);

	function compareExcludeRsync(src, dest, pattern, callback){}
	------------------------------------------------------------
	采用rsync的方式同步静态资源文件
	------------------------------------------------------------
	src			{String}		待同步的项目根目录
	dest		{String}		同步后输出的目标路径
	pattern		{RegExp}		排除的文件夹，缺省为view
	callback	{Function}		nodejs执行完命令后的回调



	function compareOnly(src, dest, setting){}
	--------------------------------------------
	采用nodejs目录遍历方式同步view层文件
	--------------------------------------------
	src			{String}		待同步的项目根目录
	dest		{String}		同步后输出的目标路径
	setting		{Object}		配置文件，用于配置匹配同步的目标文件夹（view层）
	setting缺省值为：
	{
		file: /\.tpl$/,	// 匹配的文件类型为.tpl
		dir : 'view',	// 查找的目标文件夹为view文件夹
		unfold: true	// 是否扁平化输出目录结构
						  （true为输出的目录结构与源文件不一致，只保留模块名+.tpl名
							如：源文件路径为xx/front/app/login/view/login.tpl，输出到dest为xx/views/src，则输出的login.tpl路径为xx/views/src/login/login.tpl，略去app和view两层目录）
	}
	
<br>
##htpl2js
将后缀为.htpl的html片段文件转化为seajs模块：
	
	// test.htpl
	<ul>
		<li>test</li>
	</ul>

	↓↓

	// test.htpl.js
	define('<ul><li>test</li></ul>');

>引用方式：<br>
>var Htpl2js = require('htpl2js');<br>
>Htpl2js(SYNCHROEXCLUDESRC, SYNCHROEXCLUDEDEST);

	function htpl2js(src, dest, type){}
	--------------------------------------------
	src			{String}		待转化的项目根目录
	dest		{String}		转化后输出的目标路径
	type		{RegExp}		指定匹配的文件类型，缺省为/\.htpl$/


<br>
##i18n-gettext
用于提取代码中待翻译的字符串，并通过po等翻译文档对已标记的字符串进行翻译。

>引用方式：<br>
>var I18n = require('i18n-gettext');<br>
>I18n.xgettext(SRC, DESTDIR, DESTFILE, EXIST);<br>
>I18n.gettext(EXIST, FRONTSRC, FRONTDEST);

	function xgettext(src, dest, filename, exist, type, merge){}
	------------------------------------------------------------
	提取待翻译字符串
	------------------------------------------------------------
	src			{String}		待提取翻译字符串的项目根目录
	dest		{String}		提取的po文件存放的目标目录
	filename	{String}		提取的po文件的路径
	exist		{String}		已存在的提取过的po文件，一般与filename一致
	type		{String}		输出的提取文件类型，目前仅支持.po
	merge		{Boolean}		是否合并所有提取的字段，为false时，提取出的po文件会忽略filename参数，以遍历的标记文件命名输出po文件，建议设置为true，缺省为true

	
	function gettext(i18n, src, dest, replacestr){}
	-----------------------------------------------
	翻译已标记的字符串
	-----------------------------------------------
	i18n		{String}		已翻译过的po文件路径
	src			{String}		待翻译的项目根目录
	dest		{String}		输出翻译后的项目目标目录
	replacestr	{String}		将标记的字符串替换为此参数设置的字符
	
	*备注，四种标记的规则：
	__('xx')
	__("xx")
	__'("xx")'
	__"('xx')"


<br>
##contrib-cssmin
通过gruntjs工具对css文件进行压缩。

>引用方式：<br>
>var Cssmin	= require('contrib-cssmin');<br>
>Cssmin(CSSMINSRC, CSSMINDEST, CSSMINBASE, GRUNTJS, CALLBACK);

	function cssmin(src, dest, base, gruntPath, callback, ignore){}
	---------------------------------------------------------------
	src			{String}		项目源文件夹
	dest		{String}		输出cssmin后的目标路径
	base		{String}		seajs前端配置文件base字段对应的服务器文件夹路径
	gruntPath	{String}		gruntjs工具路径
	callback	{Function}		nodejs执行完命令后的回调
	ignore		{String}		需要忽略cssmin的src下的文件夹路径，缺省为src下的lib

<br>
##cmd-transport
通过gruntjs工具对js及css文件进行transport。

>引用方式：<br>
>var Transport	= require('cmd-transport');<br>
>Transport(TRANSPORTSRC, TRANSPORTDEST, ALIAS, GRUNTJS, CALLBACK);

	function transportTask(src, dest, alias, gruntPath, callback, exclude){}
	------------------------------------------------------------------------
	src			{String}		项目源文件夹
	dest		{String}		transport后输出的目标路径
	alias		{String}		前端seajs配置的字段alias对应的__jsalias.json文件的路径
	gruntPath	{String}		gruntjs工具路径
	callback	{Function}		nodejs执行完命令后的回调
	exclude		{String}		需要忽略transport的src下的文件夹路径，缺省为src下的lib

<br>
##cmd-uglify
通过gruntjs工具对js及css文件按单一模块规则进行合并和压缩。

>引用方式：<br>
>var Uglify	= require('cmd-uglify');<br>
>Uglify(UGLIFYSRC, UGLIFYBASE, IGNORE, GRUNTJS, CALLBACK);

	function uglifyTask(modsrc, base, ignore, gruntPath, callback){}
	----------------------------------------------------------------
	modsrc		{String||Array}	指定需要uglify的源文件夹
	base		{String}		同cssmin的base
	ignore		{String}		需要忽略合并压缩的alias json文件，对应的__ignore.js文件路径
	gruntPath	{String}		gruntjs工具路径
	callback	{Function}		nodejs执行完命令后的回调


<br>
##util-mkdir
工具方法，用于创建指定的文件夹，类似linxu下的mkdir命令

>引用方式：<br>
>var mkdir = require('util-mkdir');<br>
>mkdir('xx/front/test');

	function mkdir(dir){}
	---------------------
	dir		{string}	文件夹路径



<br>
##util-mv
工具方法，用于复制指定的文件（夹）到目标文件夹，若目标文件夹中存在源文件夹不存在的文件（夹），则将其删除。

>引用方式：<br>
>var mv = require('util-mv');<br>
>mv('xx/front/test', 'xxx/front/test_dest');

	function mv(from, to){}
	-----------------------
	from	{string}	源文件（夹）
	to		{string}	目标文件（夹）



<br>
##util-rm
工具方法，用于删除指定的文件（夹）

>引用方式：<br>
>var rm = require('util-rm');<br>
>rm('xx/front/test_tmp');

	function rm(path){}
	---------------------
	path	{string}	待删除的文件（夹）



<br><br>
----------
11/29/2014	By pakinguo