#Buildjs构建流程

>分三部分来说明构建流程：实时文件监听&同步&转化、国际化、发布构建版本

Buildjs使用流程按以下步骤执行：

1. 指定项目文件目录；
2. 切换到文件目录的front文件夹下，执行命令：<pre>xxx/front: buildjs -init</pre>
3. 若报错，则说明文件目录结构与默认的标准目录规范不一致，需要更改配置文件__buildjs/xxx.json；若无报错，则说明文件实时监听脚本已经启动；
4. 编码，标记好需要翻译的字符串（若无标记，则构建后按源文输出）；
5. 提取待翻译字符串到po文件：<pre>xxx/front: buildjs -gettext en</pre>
6. 翻译：<pre>xxx/front: buildjs -xgettext en</pre>
7. 执行构建：<pre>xxx/front: buildjs -release en</pre>

构建执行的流程：

- 先进行cssmin，按单文件方式把所有css进行代码压缩；
- 接着执行cmd-transport，以文件夹为单位，对除了lib以外的其他js模块进行transport，包括所有的css文件，都会生成seajs-style所引用的模块类型；
- 最后执行cmd-uglify，这个步骤的uglify是以单一模块为单位，寻找其相关依赖链（深度依赖），同时根据配置文件提供的 __ignore.json，忽略合并配置文件提供的相关alias对象的属性（与 __jsalias.json配置文件相对应），输出合并后的文件，其中，在上一步生成的css.js文件会根据具体模块的引用情况同时合并到其模块中（若seajs模块中有同过require方式引用到css文件，会在transport的时候被加入到依赖数组中）。

【例如：widget中的seajs模块w.alert.js引用了../css/w.alert.css，那么经过cssmin和transport之后，会在css文件夹下生成一个w.alert.css.js，此时uglify后的w.alert.js则已经将w.alert.css.js的源码一起合并压缩，这样在页面上引用w.alert.css.js文件的时候就不会多一个请求，因为w.alert.js将其合并的缘故，已经被seajs添加到id序列中了。】

【再例：由于widget中的w.alert组件会在许多页面中引用，并不想把它合并到各个页面的js模块中（可复用，并通过缓存可以让浏览器不用经常重新请求），那么只需要在__ignore.json中添加w.alert.js模块id即可以避免自动合并规则将其与其他页面模块进行合并。】


<br><br>
##文件实时监听&同步&转化

>文件实时监听

确定了项目文件目录后（参考：<a href="API%20Doc/Catelog-Definition.md" target="_blank">标准目录规范</a>），有两种方式会触发文件实时监听功能：

	// 第一种方式：初始化时
	// 切换到front目录下：
	xxx/front: buildjs -init

	// 第二种方式：执行监听脚本
	xxx/front: buildjs -wstart

以上两种方式，若运行命令后抛错，则说明目录结构与默认的标准目录规范不一致，需要修改由buildjs -init生成的配置文件，文件路径位于xxx/front/__buildjs下，共有三个配置文件：**CONFIG.json**、 **XGETTEXT_CONFIG.json**、**GETTEXT_CONFIG.json**

	// 针对文件实时监听、同步以及转换.htpl文件为.js的seajs模块功能
	// CONFIG.json
	{
		// 项目模块开发源目录，即__src所在的路径，默认为当前执行buildjs -init所在文件夹下的__src
		"SRC": 		"xxx/front/__src/",

		// SeaJS前端配置文件模板路径，模板请参考下文
		"CONFSRC": 	"xxx/front/conf/__conf.js",

		// SeaJS前端配置文件合成路径
		"CONFDEST": "xxx/front/conf/conf.js",

		// JS模块别名文件，参考seajs的alias配置字段
		"JSALIAS": 	"xxx/front/conf/__jsalias.json",

		// CSS模块别名文件，类似seajs的alias，请参考源码Seacss/seacss.js，引用方式同seajs
		"CSSALIAS": PATH.join(seajsConf, '__cssalias.json'),

		// 文件实时同步源目录，此字段配置静态资源的同步（除view层）
		"SYNCHROEXCLUDESRC": 	"xxx/front/__src/",

		// 静态资源文件同步的输出路径
		"SYNCHROEXCLUDEDEST": 	"xxx/front/src",

		// 文件实时同步源目录，此字段配置view层的同步
		"SYNCHROONLYSRC": 		"xxx/front/__src/page/",

		// view层文件同步的输出路径，强调不为front后代文件夹
		"SYNCHROONLYDEST": 		"xxx/views/src",

		// 生成配置文件的版本，默认可不填，会由时间戳代替
		"VERSION": ""
	}
	// 备注：SRC和SYNCHROEXCLUDESRC路径最后需要加“/”，否则通过rsync生成的目标目录会多一层父级目录。

<br>

	// 国际化——提取待翻译字段配置
	// XGETTEXT_CONFIG.json
	{
		// 同CONFIG.json的SRC
		"SRC": 		"xxx/front/__src/",

		// 生成的po文件存放的文件夹路径，默认路径会在__buildjs下生成新文件夹i18n
		"DESTDIR": 	"xxx/front/__buildjs/i18n",

		// 生成的破文件路径，其中预留{lang}，根据提取命令指定的语言来填充
		"DESTFILE": "xxx/front/__buildjs/i18n/i18n.{lang}.po",

		// 由于项目提取的待翻译字段是增量的，需要提供已存在的翻译好的po文件（或未翻译或未全翻译），会对已存在的po文件进行合并，保留已翻译的字段，添加新增的字段，次路径一般与DESTFILE一致
		"EXIST": 	"xxx/front/__buildjs/i18n/i18n.{lang}.po",

		// 输出的文件类型，目前只支持po文件
		"TYPE": 	"po",

		// 是否需要合并，若不合并，则输出的po文件按源文件命名+.po后缀，如果提取待翻译的字符串很铃声，那么会生成很多po文件，建议默认为true
		"MERGE": 	true
	}

<br>

	// 国际化——翻译
	// GETTEXT_CONFIG.json
	{
		// 供翻译参考的po文件，与XGETTEXT_CONFIG.json的DESTFILE一致
		"I18N": 		"xxx/front/__buildjs/i18n/i18n.{lang}.po",

		// 由于项目文件是分开静态资源和view页面模板，需要对应两个字段来配置，其中需要预留{lang}，用于通过命令输出指定的语言类型
		"FRONTSRC": 	"xxx/front/src",
		"FRONTDEST": 	"xxx/front/{lang}",
		"VIEWSRC": 		"xxx/views/src",
		"VIEWDEST": 	"xxx/views/{lang}",

		// 此字段是额外功能，用于将所有提取的待翻译字符串替换成指定的某个符号，如"※"，用于预览代码中有哪些待翻译的字段未被标记出来，默认不取空字符串
		"REPSTR": 		""
	}

<br>

	// __conf.js模板
	// TODO

<br><br>
##国际化
国际化分两步执行：线提取待翻译字符串，生成po文件，交给专员翻译后，再执行翻译功能。

	// 提取，语言参数可选，默认空时取en
	xxx/front: buildjs -xgettext [en[,cn,id,...]]

	// 翻译
	xxx/front: buildjs -gettext [en[,cn,id,...]]

相关的配置文件参考上文提供的配置字段。

国际化需要注意的是对po文件进行翻译，而且不同语言会生成不同的副本。具体可以允许命令查看生成的po文件即可。由于生成的po文件是自主编写的文件合成，其是否符合po文件的规范有待更多的测试和优化，这里标记“TODO & TOTEST”。

\#备注：这里国际化仅仅只支持国际化，不支持本地化。本地化需要一些逻辑来做不同国家具体页面的UI设计，国际化只是简单的翻译，并非有高级功能的判断来根据不同国家的需求展示不同的UI。这部分可以配合服务器语言来完成，如php+smarty。

<br><br>
##发布构建版本
构建发布版本只需执行：
<pre>xxx/front: buildjs -release en</pre>

此时，Buildjs会先生成发布需要的配置文件RELEASE_CONFIG_en.json，接着执行国际化，最后才执行发布构建。发布构建需要的配置文件对应如下：

	// RELEASE_CONFIG_en.json
	{
		// cssmin的源路径，一般为实时文件同步脚本设置的输出目标路径
		"CSSMINSRC": 	"xxx/front/src",

		// cssmin输出的文件路径，设置临时目录，为的是做中间处理，构建完成后会删除此目录
		"CSSMINDEST": 	"xxx/front/src_tmp",

		// 这个字段的设置是为了把css中出现的图片资源的相对路径替换为以"/front/en"这种方式的相对路径，
		// 一般项目是有域名的，域名访问的图片资源等在css中书写多为相对当前css文件的目录路径，
		// 构建成seajs模块的内联方式的css不能以这种相对路径方式访问，会被定位成以页面基准的相对路径，这样就会访问不到图片资源。
		"CSSMINBASE": 	"/front/en",

		// cmd-transport的源文件夹
		"TRANSPORTSRC": "xxx/front/src_tmp",

		// cmd-transport的目标文件夹
		"TRANSPORTDEST":"xxx/front/en",

		// 需要合并压缩的自动检索模块的目录，一般为标准目录规范的page和widget文件夹，若需要添加，可在第一次构建后再修改配置文件，再重新构建。
		"UGLIFYSRC": 	["xxx/front/en/page", "xxx/front/en/widget"],

		// uglify的根目录路径，与seajs的conf的base字段相对应
		"UGLIFYBASE": 	"xxx/front/en",

		// 同上文
		"ALIAS": 		"xxx/front/conf/__jsalias.json",

		// 同上文
		"IGNORE": 		"xxx/front/conf/__ignore.json",

		// 此字段是由工具直接生成，一般是buildjs.cli.js所在文件夹下的node_modules/gruntjs
		"GRUNTJS": 		"xxx/buildjs/node_modules/gruntjs"
	}

第一次构建会生成以上的配置文件，若已经手动创建好，则不会再生成新的配置文件，需要根据项目做更改则只需修改配置文件的字段值即可。

\# 更多API使用方式请参考：<a href="API%20Doc/Cmd-Api.md" target="_blank">命令行API</a>和<a href="API%20Doc/Func-Api.md" target="_blank">功能组件API</a>