#Buildjs命令行API
先确保在linux下已经部署好环境，参照：<a href="../README.md#一环境安装" target="_blank">使用教程之环境安装</a>

**所有命令行运行都需要切换到项目所在的文件夹下，才可执行。以下API以项目路径
*xx/front*为例。**

<br><br>
##buildjs-init
> **初始化配置文件、实时文件监听、同步、html片段文件转化为seajs模块**

	// 确保项目目录结构与Buildjs给出的标准目录规范一致
	xx/front: buildjs -init

在当前文件夹下新建新的文件夹：__ buildjs，用于放置buildjs相关的配置文件；初始化后该文件夹下有五个文件：CONFIG.json、XGETTEXT_CONFIG.json、GETTEXT_CONFIG.json、mconf.log、mrsync.log，分别用于实时文件监听同步&html片段转化、国际化提取待翻译字段、国际化翻译、记录生成seajs前端配置文件的实时文件监听inotifywait的pid、其他文件实时监听&同步的inotifywait的pid。配置文件的字段描述已在文档<a href="Build-Process.md#文件实时监听+同步+转化" target="_blank">Build-Process.md</a>详细给出。如果目录结构与*标准目录规范*不一致，可修改生成的配置文件对应的字段并重启监听脚本。

初始化成功的wording提示：

	xx/front: Inotifywait of xx/front/__src/ was started!
	Please press ctrl+c to quit the cmd!
	Inotifywait of xx/front/conf was started!
	Please press ctrl+c to quit the cmd!
	|

<br><br>
##buildjs-wstart
>启动buildjs实时文件监听+同步+转化

	xx/front: buildjs -wstart

此命令用于重启buildjs的实时文件监听功能，wstart为watch start的缩写。当-init不成功时，需要对配置文件进行修改，修正后再运行此命令即可重启监听功能（或已经用过-wstop停止监听，想要重启项目的监听功能）。此命令启动时会先调用-wstop来停止可能已有运行的inotifywait进程，再重新开启。

只要监听的项目文件夹有做任何文件的增删改动作，都会根据变动的文件类型做相应的文件同步、合成或转化。

具体以下三种操作：

1. 将__src的非view层资源同步到xx/front/src路径下，同时将其view层资源同步到xx/views/src路径下；
2. 将自定义html片段模板类型.htpl转化为seajs模块，主要是分离在js中编写html字符串，为可选编程方式；
3. xx/front/conf下的源文件有做变动，则生成新的前端配置文件。

<br><br>
##buildjs-wstop
>停止buildjs实时文件监听功能

	xx/front: buildjs -wstop

此命令用于停止buildjs的实时文件监听功能，停止后，对__src的任何操作都不会触发文件同步，同时，构建时也不会将 __src的文件先进行实时同步再构建。（这里的逻辑有待改进，应该需要确保构建的时候需要做一次初始化同步，-wstart的脚本也存在一样的问题）

<br><br>
##buildjs -xgettext [lang]