var FS = require('fs');
var PATH = require('path');
var CHILDPROCESS = require('child_process');

module.exports = function(src, exec, conf, pidFile){
	var cmd = 'inotifywait -qmre modify,create,delete,move ' + src + ' | while read DIR EVENT FILE\ndo\nnode ' + exec + ' ' + conf + ' $DIR $FILE $EVENT\ndone &\necho ' + src + ' > ' + pidFile

	CHILDPROCESS.exec(cmd, function(err, stdout, stderr){
		if(err !== null){
			console.log('inotifywait error: ' + err);
		}
	});

	console.log('Inotifywait of ' + src + ' has been started!\nPlease press ctrl+c to quit the cmd!');
}