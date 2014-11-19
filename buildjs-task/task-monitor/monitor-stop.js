var FS = require('fs');
var PATH = require('path');
var CHILDPROCESS = require('child_process');

module.exports = function(src){
	try{
		var ipath = PATH.join(src, 'mconf.log');
		var isrc = FS.readFileSync(ipath, 'utf8').replace(/\r\n|\n/g, '');
		var cmd = "ps -ef | grep inotifywait | grep " + isrc + " | awk -- '{print $2}' > " + ipath + "\ncat " + ipath + " | while read line\ndo\nkill -9 $line\ndone\n";
		CHILDPROCESS.exec(cmd, function(err, stdout, stderr){
			if(err){
				// console.log(err);
			}
		});

		ipath = PATH.join(src, 'mrsync.log');
		isrc = FS.readFileSync(ipath, 'utf8').replace(/\r\n|\n/g, '');
		cmd = "ps -ef | grep inotifywait | grep " + isrc + " | awk -- '{print $2}' > " + ipath + "\ncat " + ipath + " | while read line\ndo\nkill -9 $line\ndone\n";
		CHILDPROCESS.exec(cmd, function(err, stdout, stderr){
			if(err){
				// console.log(err);
			}
		});
	}catch(e){
		
	}
}