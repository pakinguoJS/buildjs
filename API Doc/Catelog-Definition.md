#Web前端开发标准目录规范 Beta

>项目目录结构是为适应项目而设计，主要从三方面来考虑：*是否影响开发效率*、*是否影响维护成本*、*是否可支持集成构建*

<br>

## 旧项目通用目录规范分析 ##

以前常见到的目录规范有：

	├ front
    .   ├ css
    .       ├ module
    .           └ m.css
    .       └ common
    .           └ normalize.css
    .   ├ img
    .       ├ module
    .           └ m.png
    .       └ common
    .           └ bg.jpg
    .   ├ js
    .       ├ module
    .           └ m.js
    .       ├ lib
    .           └ jquery.js
    .       ├ widget
    .           └ w.alert
    .               ├ w.alert.css
    .               └ w.alert.js
    .       └ common
    .           └ common.js
    .   └ tpl
    .       ├ m.tpl
    .       └ common_layout.tpl

这样的目录结构虽然清晰明了地知道各个文件夹放置的是哪些文件，但是，会将页面需要引用的相应静态资源分散开来。即使以相应的页面名称作为文件夹分档命名，当页面模块持续增加时，会使目录结构增量增长，到时通过IDE或者文本编辑器查找页面对应的静态资源时，会有一定程度影响到开发效率。同时，后期维护的时候，会由于模块过多而难以快速定位需要修改的具体文件（如修改的css是内联的，还是在css文件中，需要在css和tpl来回切换查找），增加了维护成本。此外，如果是某些页面模块通用的组件（一般为js组件），可能包含css或jpg等静态资源文件，那么为了方便开发和维护，必然会选择将其放置在某个文件夹下，这样js文件夹就失去了它命名的意义。

旧的目录结构规范明显有许多不足的地方，需要进行改进。

<br>
##适用于Buildjs的标准目录规范

	project
    ├ front
    .   ├ conf（开发时关注的配置文件目录）
    .       ├ __conf.js
    .       ├ __jsalias.json
    .       ├ __cssalias.json
    .       ├ __ignore.json
    .       └ conf.js（由构建工具生成）
    .   ├ __src（开发时关注的模块目录）
    .       ├ page
    .           ├ common
    .               ├ normalize.css
    .               ├ common.css
    .               ├ common.js
    .               └ view
    .                   ├ head.tpl
    .                   └ foot.tpl
    .           ├ login
    .               ├ css
    .                   └ index.css
    .               ├ img
    .                   ├ icon.png
    .                   ├ index.png
    .                   └ ...
    .               ├ js
    .                   └ index.js
    .               └ view
    .                   └ login.tpl(运行工具后，不会同步到src下，而是同步到views)
    .       ├ lib（基本上是增量添加第三方库，可考虑按需放到CDN）
    .       └ widget
    .          ├ alert
    .              ├ alert.css
    .              ├ alert.js
    .              └ alert.htpl (通过编译工具 => alert.htpl.js, 符合seajs模块)
    .    ├ src（从__src生成而来通过编译工具同步生成，目录结构与__src一致，但出去view文件夹）
    .    ├ en-US（由国际化工具生成的）
    .    └ zh-TW（同上）
    └ views（有工具同步front下的__src中的view层文件到此目录，只保留两层目录结构）
         ├ src
             ├ common
                 ├ head.tpl（只保留两层目录结构：模块名/文件名.tpl）
                 └ foot.tpl
             └ login
                 └ login.tpl

由于Buildjs基于SeaJS的CMD模块标准，除了conf目录是额外标准外，__src的目录结构即是以模块为单位的标准目录规范，约定将一个页面（或插件组件）的css、js、图片、页面等都归入到一个文件夹下，以页面功能、模块来命名，这样，无论往后业务如何增加，都是以单一文件夹方式增长，通过命名区分，可以快速定位，方便开发和维护。但这里会有新的问题：一般静态资源文件是由服务器开放可以通过url方式直接访问，由于发布的时候，若view文件夹下的.tpl（一般是应用php的模板引擎smarty插件）也可被url直接访问，那么可能部分业务处理的逻辑会被暴露（当然这种情况会比较少，毕竟tpl一般只用于数据展示，尽量不会做过多的算法逻辑和入库操作），这样会有隐式的安全，故需要通过后台工具，来做预处理。Buildjs提供了这样的功能，将 __src下的view层跟其他静态资源分别同步到front/src和views/src（默认配置，可以通过修改相关配置文件更改路径）。

这样的目录结构，配合SeaJS模块化编程方式，可以很方便地移植或复用通用组件或插件。

传统引用方式为：

	<link rel="stylesheet" type="text/css" href="xxx/widget/css/w.alert.css"/>
	<script type="text/javascript" src="xxx/widget/js/w.alert.js"></script>

	#module.js
	// 单例模式
	WAlert('msg');
	// 工厂模式
	var Alert = new WAlert();
	Alert('msg');

缺点：倘若组件的命名与其他团队成员编写的组件命名有冲突，而且在同个页面中加载，那么会引起难以发现的bug。

SeaJS方式：

	#module.js
	define(function(){
		// 单例
		var Alert = require("xxx/widget/js/w.alert.js");
		// 工厂
		var Alert = new require("xxx/widget/js/w.alert.js");
		// #甚至可以在w.alert.js内已经做好工厂模式的构造
		Alert('msg');
	});

	#w.alert.js
	...
	// 已经引用了css，可通过构建工具将其转化为内联样式，与w.alert.js合并压缩
	require('../css/w.alert.css'); 
	...

对比使用SeaJS方式，无论在加载还是在调用上，都比传统方式来得方便、不冲突，而且真正做到只关注开发，无需太多关注合并压缩问题。Buildjs就是将合并压缩的工作作为构建时由工具自动去分析生成。

<br>
##后序
对于Web前端的目录结构（只针对静态资源和页面，不包含php等其他服务器脚本或开发语言文件）来说，并没有完美的标准目录结构，只有适用于自己项目的目录结构规范。规范可以灵活变动，但最好在制定规范后，就不要经常变动。


<br><br>
----------
11/25/2014 By pakinguo