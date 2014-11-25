#Buildjs

>基于Seajs与Nodejs的前端集成自动化构建方案

>**环境要求：Linux 2.6+ / Nodejs / rsync / inotifywait**

>标签：*Web前端集成自动化构建* , *Buildjs*

<br>

## 前序
随着项目业务逻辑的增加，先前的开发方式已经多少会对效率产生一定的影响。同时，对于旧页面和模块的复用，大部分方式是ctrl+c & v，而不是真正意义上的引入组件配置化。以及，对于前端性能的优化，旧项目基本没有涉足，仅仅做到的小部分，只有在移动web页面针对菲律宾马来等网络速度不是很快的国家，才有针对性地手动合并压缩静态资源文件。由于大部分项目是一人责任制，比较少有合作开发，故命名空间的污染问题基本没遇到。但是随着项目进展，迭代的快速开发，合作开发已经开始增多。

现状是，web前端在js上除了用jquery、zepto以及knockoutjs、backbone、underscore等比较多的针对DOM操作或渲染模板的第三方框架外，没用其他管理模块或管理整个架构的第三方框架或编译器。这样，虽然对于快速迭代开发来说效率依然保持较高的状态，但是，没太多的管理工具会导致在维护或者代码合并压缩上有很大的障碍。通用组件的复用上会因为修改了某一个文件，导致另一个复用相同代码的组件也需要同时修改，而不是在其基础上进行扩展修改。

配合php端使用的smarty，前端的tpl、js、css等开发时是分别放置于不同的目录下：tpl放置于views目录，而js、css等放置在resource目录下，同时，views与resource同级。当业务对应的页面不是很多的时候，没多大问题会暴露出来。但随着业务的增多，resource和views两者间在IDE或者文本编辑器上就很难在一个屏幕内轻松的找到对应的模块了。而且，当一个bug出现，需要快速定位修复时，页面和js、css来回查找，一定程度上影响了效率。旧的目录规范已经不太适合日益增长的业务模块了。

没有自动化工具可以来合并压缩指定的文件，或者进行国际化翻译代码，基本都是手动处理，浪费时间浪费精力，前端性能优化有待提高。
基于以上的问题，需要采用新的开发模式来提高开发效率、前端性能。面向模块化编程越来越被Web前端所接受。为了不重造轮子，于是，从requirejs和seajs中，选择了seajs，原因是比seajs更易上手，且跟nodejs保持一致的cmd规范，再加上seajs开发的项目进行构建编译有比较强力的工具后盾（gruntjs+npm，社区比较活跃）。接着，在文件目录规范上需要做调整，以模块为单位，将所有静态资源文件和页面都放在同一个模块命名的文件夹下，再用子文件夹区分。然后，需要对构建工具gruntjs进一步进行封装，提供自动化与手动化两种方案用于构建项目。最后，需要做国际化支持，这跟新的目录结构规范也相呼应。

简易图示：

![Buildjs 简易图示](http://sz.yun.ftn.qq.com/ftn_handler/7e1e2157750e098b7c997de1ac888e0ce7f83612fec01e57ae426b3b451f9cb6/?fname=web%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91%E4%BD%93%E7%B3%BB.png&cn=0&cv=30111&size=640*640)

<br>
<br>
## Buildjs构建简述
Buildjs为Web前端提供一套标准的目录结构和集成编译解决方案，基于Nodejs、linxu支持的inotify（应用其扩展工具inotifywait）和arsync、以及npm的Javascript构建工具gruntjs与其相关插件。主要解决了Web前端开发的一系列流程问题：

1. 制定项目目录标准规范，分离业务、组件、页面的耦合
2. 开启实时文件监听功能，即时做部分编译
3. 国际化支持，提供提取待翻译字符串和翻译功能
4. 构建，包括transport、uglify

由于Buildjs需要安装相关的环境程序，具体请参考[使用教程](#使用教程)

<br>
<br>
## Buildjs功能简述
>###一、标准目录规范

制定目录规范不仅可以统一团队编码习惯，而且可以提高编码效率。除此之外，对于集成自动化构建也有所帮助。按照模块化思想，可取的目录规范如下：
<pre>
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
</pre>
开发者只需专注于project/front/__src和project/front/conf，其他相关文件都由构建工具通过配置文件实时生成或发布生成。

\# 目录规范详细介绍请参考：[Catalog-Definition.md](API%20Doc/Catalog-Definition.md)

<br>
>###二、开启实时同步&国际化&发布

规范好项目文件目录结构，就可以准备开始写业务或功能代码。由于开发人员专注的__src和conf的相关文件都是未经过实时同步，并非页面看到时加载的静态资源文件或页面文件，需要对项目文件夹进行实时文件监听：

    // 在Linux切换到项目文件夹的路径下，如切换到/data/proj4test/front
	xxx~: cd /data/proj4test/front
	/data/proj4test/front: buildjs -init

此时，buildjs会初始化相关的默认配置文件，生成的文件会放在/data/proj4test/front/__buildjs的文件夹下。由于默认配置文件对应的路径与文件目录结构规范一致，若进行init的时候不一致，则实时文件监听脚本会无法运行，需要对配置文件做修改，对应的配置文件有以下：
<pre>
../__buildjs
     ├ CONFIG.jsson（实时同步文件的配置文件）
     ├ GETTEXT_CONFIG.json（国际化翻译配置文件）
     ├ XGETTEXT_CONFIG.json（提取国际化待翻译的字符串配置文件）
     ├ mconf.log（记录inotifywait进程pid）
     └ mrsync.log（同上）
</pre>
相应修改完项目路径后，再执行命令：

	/data/proj4test/front: buildjs -wstart

之后，在对__src或conf下的文件做增删改的时候，就会实时触发相应的操作，同步变更的文件到front/src以及views/src（路径都是以CONFIG.json配置为准）。

----------


开发完成src源版本后，若需要国际化，则可以执行以下命令提取待翻译的字符串：

	/data/proj4test/front: buildjs -xgettext en

会生成po文件到__buildjs/i18n。生成的字段是根据 __src下已做了标记的字符串来提取的，国际化标记支持以下四种方式，兼容html和js做标记。：

	__('***')
	__("***")
	__'("***")'
	__"('***')"

提出成po文件后，可交给翻译小组翻译，翻译好后替换提取的po文件（若再次提取，会保留已经翻译好的字段及其对应的翻译），再执行命令即可完成国际化：

	/data/proj4test/front: buildjs -gettext en

会生成front/en以及views/en，文件对应front/src和views/src。

----------

完成开发后，可直接执行以下命令生成发布文件：

	/data/proj4test/front: buildjs -release en

编译工具会在原来文件的基础上进行文件处理、合并压缩以及优化等。由于Buildjs倡导的是开发者只关注__src，国际化交给翻译（提取翻译字段依然需要开发手动标记），发布时无需关注构建（全量覆盖发布），故对应生成的en或其他语言版本的文件都会被编译后的代码覆盖。当然，开发时依然可以通过国际化命令来还原文件。

\# 构建流程的详细介绍请参考：[Build-Process.md](API%20Doc/Build-Process.md)

<br>
>###三、构建功能API

####命令行API
\# 参考：[Cmd-Api.md](API%20Doc/Cmd-Api.md)

- 构建初始化：[buildjs -init](API%20Doc/Cmd-Api.md#buildjs-init)
- 启动实时文件监听&同步：[buildjs -wstart](API%20Doc/Cmd-Api.md#buildjs-wstart)
- 停止实时文件监听&同步：[buildjs -wstop](API%20Doc/Cmd-Api.md#buildjs-wstop)
- 国际化之提取待翻译字段：[buildjs -xgettext [lang]](API%20Doc/Cmd-Api.md#buildjs-xgettext[lang])
- 国际化之翻译字段：[buildjs -gettext [lang]](API%20Doc/Cmd-Api.md#buildjs-gettext[lang])
- 构建发布版本：[buildjs -release [lang]](API%20Doc/Cmd-Api.md#buildjs-release[lang])
- 查看当前编译工具版本号：[buildjs -v](API%20Doc/Cmd-Api.md#buildjs-v)

----------


####功能API
\# 参考：[Cmd-Api.md](API%20Doc/Func-Api.md)

- [alias-conf](API%20Doc/Func-Api.md#alias-conf)
- [cmd-transport](API%20Doc/Func-Api.md#cmd-transport)
- [cmd-uglify](API%20Doc/Func-Api.md#cmd-uglify)
- [contrib-cssmin](API%20Doc/Func-Api.md#contrib-cssmin)
- [i18n-gettext](API%20Doc/Func-Api.md#i18n-gettext)
- [synchronize-files](API%20Doc/Func-Api.md#synchronize-files)
- [util-mkdir](API%20Doc/Func-Api.md#util-mkdir)
- [util-mv](API%20Doc/Func-Api.md#util-mv)
- [util-rm](API%20Doc/Func-Api.md#util-rm)

<br>
## 使用教程
>###一、环境安装

- NodeJS: [Download Source](http://nodejs.org/download/)
- rsync：[Download Source](https://rsync.samba.org/ftp/rsync/)
- inotify-tools：[Download](http://github.com/downloads/rvoicilas/inotify-tools/inotify-tools-3.14.tar.gz)

inotify-tools采用make&make install的安装方式可能存在调用时会报错，需要用ln -s方式把解压出来的inotify-tools文件夹下的src/inotifywait 链接到 /usr/local/bin/inotifywait，才可以在全局执行inotifywait。更多使用方式请参考inotify-tools的github:[inotify-tools](https://github.com/rvoicilas/inotify-tools/wiki)

将当前github的以下文件（夹）部署到服务器上：

- bin
- buildjs-task
- node_modules
- buildjs.cli.js
- package.json

之后执行
	
	~: ln -s xxx/bin/buildjs /usr/local/bin/buildjs

将buildjs添加到全局环境中。

<br>
>###二、Buildjs使用

1. 按照标准目录结构创建项目（只需要放置前端模块的文件夹front）
2. 切换到front路径下，执行初始化命令：buildjs -init；若文件目录结构没有按照标准目录结构设定，则需要手动更改front/__buildjs下的*.json配置文件，具体参考[buildjs -init](API%20Doc/Cmd-Api.md#buildjs-init)；
3. 停止实时同步文件监听功能：buildjs -wstop；重新打开监听功能：buildjs -wstart；
4. 国际化提取待翻译字段：buildjs -xgettext en，需要按照4种标记方式做记号（参考上文）；
5. 国际化翻译代码：buildjs -gettext en，确保提取出来的po文件已经过翻译；
6. 构建发布代码：buildjs -release en。

<br><br>
----------
11/25/2014 By pakinguo


