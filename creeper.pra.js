var http = require('http'),
	cheerio = require('cheerio'),
	fs = require('fs');

	// 被查询的目标地址
var queryHref = 'http://www.haha.mx/topic/1/new/',
	// 确定目标
	goalStr = '.joke-list-item .joke-main-content a img',
	// 下载至，目录
	downloadDir = './upload/topic1/',
	// 用来存放图片地址的数组
	urls = [],
	sumCount = 0,
	// 重复的图片数量
	repeatCount = 0,
	// 实际下载的数量
	downloadCount = 0;

/**
 * 根据url和参数获取分页内容
 * @param {String}: url
 * @param {int}: search
 */
function getHtml(href, search, goalStr) {
	var pageData = '',
		req = http.get(href + search, function(res) {
			// 字符编码
			res.setEncoding('utf8');
			// 数据监听
			res.on('data', function(chunk) {
				pageData += chunk;
			});
			// 监听数据传输结束
			res.on('end', function() {
				$ = cheerio.load(pageData);
				// 爬的目标对象
				var goal = $('' + goalStr);
			
				for ( var i = 0; i < goal.length; i ++ ) {
					// 获取地址
					var src = goal[i].attribs.src;
					// 筛选掉广告
					if ( src.indexOf('http://image.haha.mx') > -1 ) {
						// 把地址放入 urls 数组中
						urls.push(src);
					}
				}

				if ( search == pagemax ) {
					console.log('读取所有地址 over----');
					sumCount = urls.length;
					console.log('urls 长度是：' + sumCount);
					console.log('开始下载图片----');
					downloadImage(urls.shift());
				}
			});
		});
}

/**
 * 下载图片
 * @param {String} url: 图片地址
 */
function downloadImage(url) {
	var narr = url.replace('http://image.haha.mx/', '').split('/'),
		fileName = downloadDir + narr[0] + narr[1] + narr[2] + '_' + narr[4];	// 文件名
	// 判断该文件名是否已存在，或文件是否已下载
	fs.exists(fileName, function(exists) {
		if ( !exists ) {
			// 文件不存在，则下载
			http.get(url.replace('/small/', '/big/'), function(res) {
				var imgData = '';
				res.setEncoding('binary');

				res.on('data', function(chunk) {
					imgData += chunk;
				});

				res.on('end', function() {
					var savePath = downloadDir + narr[0] + narr[1] + narr[2] + '_' + narr[4];
					fs.writeFile(savePath, imgData, 'binary', function(err) {
						if ( err ) {
							console.log(err);
						} else {
							// 打印出图片名称
							console.log(narr[0] + narr[1] + narr[2] + '_' +narr[4]);
							downloadCount++;

							if ( urls.length > 0 ) {
								downloadImage(urls.shift());
							} else {
								console.log('全部下载over----');
								console.log('重复的图片数量：' + repeatCount);
								console.log('实际下载的数量：' + downCount);
							}
						}
					});
				});
			});
		} else {
			// 存在
			repeatCount++;
		}
	});

	if ( urls.length <= 0 ) {
		console.log('全部下载over----');
		console.log('重复的图片数量：' + repeatCount);
		console.log('实际下载的数量：' + downCount);
	}
}

var pagemax = 5,
	startPage = 1;

function start() {
	console.log('开始连接----');
	for ( var i = startPage; i <= pagemax; i ++ ) {
		getHtml(queryHref, i, goalStr);
	}
}

start();
