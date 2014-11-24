#Buildjs

@author pakinguo
>基于Seajs与Nodejs的前端微型自动化集成构建方案

## 前序
随着项目业务逻辑的增加，先前的开发方式已经多少会对效率产生一定的影响。同时，对于旧页面和模块的复用，大部分方式是ctrl+c & v，而不是真正意义上的引入组件配置化。以及，对于前端性能的优化，旧项目基本没有涉足，仅仅做到的小部分，只有在移动web页面针对菲律宾马来等网络速度不是很快的国家，才有针对性地手动合并压缩静态资源文件。由于大部分项目是一人责任制，比较少有合作开发，故命名空间的污染问题基本没遇到。但是随着项目进展，迭代的快速开发，合作开发已经开始增多。

现状是，web前端在js上除了用jquery、zepto以及knockoutjs、backbone、underscore等比较多的针对DOM操作或渲染模板的第三方框架外，没用其他管理模块或管理整个架构的第三方框架或编译器。这样，虽然对于快速迭代开发来说效率依然保持较高的状态，但是，没太多的管理工具会导致在维护或者代码合并压缩上有很大的障碍。通用组件的复用上会因为修改了某一个文件，导致另一个复用相同代码的组件也需要同时修改，而不是在其基础上进行扩展修改。

配合php端使用的smarty，前端的tpl、js、css等开发时是分别放置于不同的目录下：tpl放置于views目录，而js、css等放置在resource目录下，同时，views与resource同级。当业务对应的页面不是很多的时候，没多大问题会暴露出来。但随着业务的增多，resource和views两者间在IDE或者文本编辑器上就很难在一个屏幕内轻松的找到对应的模块了。而且，当一个bug出现，需要快速定位修复时，页面和js、css来回查找，一定程度上影响了效率。旧的目录规范已经不太适合日益增长的业务模块了。

没有自动化工具可以来合并压缩指定的文件，或者进行国际化翻译代码，基本都是手动处理，浪费时间浪费精力，前端性能优化有待提高。
基于以上的问题，需要采用新的开发模式来提高开发效率、前端性能。面向模块化编程越来越被Web前端所接受。为了不重造轮子，于是，从requirejs和seajs中，选择了seajs，原因是比seajs更易上手，且跟nodejs保持一致的cmd规范，再加上seajs开发的项目进行构建编译有比较强力的工具后盾（gruntjs+npm，社区比较活跃）。接着，在文件目录规范上需要做调整，以模块为单位，将所有静态资源文件和页面都放在同一个模块命名的文件夹下，再用子文件夹区分。然后，需要对构建工具gruntjs进一步进行封装，提供自动化与手动化两种方案用于构建项目。最后，需要做国际化支持，这跟新的目录结构规范也相呼应。

简易图示：

![Buildjs 简易图示](http://sz.yun.ftn.qq.com/ftn_handler/7e1e2157750e098b7c997de1ac888e0ce7f83612fec01e57ae426b3b451f9cb6/?fname=web%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91%E4%BD%93%E7%B3%BB.png&cn=0&cv=30111&size=640*640)

## 简介
Buildjs为Web前端提供一套标准的目录结构和集成编译解决方案，基于Nodejs、linxu支持的inotify（应用其扩展工具inotifywait）和arsync、以及npm的Javascript构建工具gruntjs与其相关插件。主要解决了Web前端开发的一系列流程问题：

1. 制定项目目录标准规范，分离业务、组件、页面的耦合
2. 开启实时文件监听功能，即时做部分编译
3. 国际化支持，提供提取待翻译字符串和翻译功能
4. 构建，包括transport、uglify

由于Buildjs需要安装相关的环境程序，具体请参考[附录](#附录)

## Buildjs功能详解
>###首要准备：标准目录规范

制定目录规范不仅可以统一团队编码习惯，而且可以提高编码效率。除此之外，对于集成自动化构建也有所帮助。按照模块化思想，较为可取的目录标准如下：
<pre>
project
    ├ front
    .   ├ conf（开发时关注的配置文件目录）
    .   ├ __src（开发时关注的模块目录）
    .       ├ app
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

## 功能API
- [alias-conf](API%20Doc/api.md#alias%20conf)

## 附录
