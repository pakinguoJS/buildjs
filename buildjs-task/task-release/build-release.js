module.exports = function(conf){
	var FS 		= require('fs');
	var PATH 	= require('path');
	var cssmin		= require('contrib-cssmin');
	var transport	= require('cmd-transport');
	var uglify		= require('cmd-uglify');
	var config		= require(conf);
	/**
	 * 执行流程：
	 * 1、copy：源项目文件，其中不包括源文件夹下的lib文件夹
	 * 2、transport：覆盖掉cmd模块
	 * 3、将step1未copy的文件夹再复制到transport之后的文件夹下
	 * 4、uglify：合并压缩，以单一模块为单位（模块包括其依赖链），需要传入忽略合并的模块列表
	 */
	var s = new Date().getTime();

	cssmin(config.CSSMINSRC, config.CSSMINDEST, config.CSSMINBASE, config.GRUNTJS, function(){
		transport(config.TRANSPORTSRC, config.TRANSPORTDEST, config.ALIAS, config.GRUNTJS, function(){
			uglify.uglifyTask(config.UGLIFYSRC, config.UGLIFYBASE, config.IGNORE, config.GRUNTJS, function(){
				console.log("============= Finish in: " + (new Date().getTime() - s) + " ms ==============");
			});
		});
	});

}