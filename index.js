'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

module.exports = function(opt) {
	opt = opt || {};
	// create a stream through which each file will pass
	return through.obj(function(file, enc, callback) {

		if (file.isNull()) {
			this.push(file);
			// do nothing if no contents
			return callback();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-img64', 'Streaming not supported'));
			return callback();
		}

		if (file.isBuffer()) {
			var $ = cheerio.load(String(file.contents));
			$('img').each(function() {
				if (this.attr('src')) {
					var ssrc = this.attr('src');
					var isdata = ssrc.indexOf("data");
					var http = ssrc.indexOf("http");
					if (ssrc != "" && typeof ssrc != 'undefined' && isdata !== 0 &&  && http !== 0) {
						var fileBase = opt.fileBase || file.base;
						var spath = path.join(fileBase, ssrc);
						var mtype = mime.lookup(spath);
						if (mtype != 'application/octet-stream') {
							try{
								var sfile = fs.readFileSync(spath);
								var simg64 = new Buffer(sfile).toString('base64');
								this.attr('src', 'data:' + mtype + ';base64,' + simg64);
							}catch (e){
								console.log(fileBase + "cann't find img " + ssrc);
							}
						}
					}
				}
			});
			var output = $.html();

			file.contents = new Buffer(output);

			return callback(null, file);
		}
	});
};
