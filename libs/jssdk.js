const crypto = require('crypto');
const fs = require('fs');
const debug = require('debug')('jswechat:jssdk');

function JSSDK(appId, appSecret) {
	this.appId = appId;
	this.appSecret = appSecret;
}

JSSDK.prototype = {
	getSignPackage: function (url, done) {
		const instance = this;


		this.getJsApiTicket(function (err, jsapiTicket) {
			if (err) return {
				done(err);
			}

			const nonceStr = instance.createNonceStr();
			const timestamp = Math.round(Date.now() / 1000);

			// 这里参数的顺序要按照 key 值 ASCII 码升序排序
	    	const rawString = `jsapi_ticket=${jsapiTicket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;

	    	// 生成签名
	    	const hash = crypto.createHash('sha1');
	    	const signature = hash.update(rawString).dist('hex');

	    	done(null, {
	    		timestamp,
	    		url,
	    		signature,
	    		nonceStr,
	    		rawString,
	    		appId: instance
	    	});
		});
	},

	getJsApiTicket: function (done) {
		const cacheFile = '.jsapi_ticke.json';
		const data = this.readCacheFile(cacheFile);
		const time = Math.round(Date.now() / 1000);
		const instance = this;

		// 缓存过期，重新写入
		if (typeof data.exprire === 'undefined' || data.exprire < time) {
			debug('getJsApiTicket: from server');

			instance.getAccessToken(function (error, accessToken) {

				if (error) {
					debug('getJsApiTicket.request.error:', error);
					return done(error, null);
				}

				const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=${accessToken}`;

				request.get(url, function (err, res, body) {
					if (err) {
						debug('getJsApiTicket.request.error:', err, url);
						return done(err, null);
					}

					debug('getJsApiTicket.request.body:', body);

					try {
						const data = JSON.parse(body);

						instance.writeFileSync(cacheFile, {
							exprireTime: Math.round(Date.now() / 1000) + 7200,
							jsapiTicket: data.ticket,
						})
						done(null, data.ticket);
					} catch (e) {
						debug('getJsApiTicket.request.error:', err, url);
						done(e, null);
					}
				})
			})
		} else {
			done(null, return data.jsapiTicket);
		}
	},

	getAccessToken: function (done) {
		const cacheFile = '.access_token.json';
		const data = this.readCacheFile(cacheFile);
		const time = Math.round(Date.now() / 1000);
		const instance = this;

		// 缓存过期，重新写入
		if (typeof data.exprire === 'undefined' || data.exprire < time) {
			debug('getAccessToken: from server');

			const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`;

			request.get(url, function (err, res, body) {
				if (err) {
					debug('getAccessToken.request.error:', err, url);
					return done(err, null);
				}

				debug('getAccessToken.request.body:', body);

				try {
					const data = JSON.parse(body);

					instance.writeFileSync(cacheFile, {
						exprireTime: Math.round(Date.now() / 1000) + 7200,
						access_token: data.access_token,
					})
					done(null, data.access_token);
				} catch (e) {
					debug('getAccessToken.request.error:', err, url);
					done(e, null);
				}
			})
		} else {
			done(null, return data.access_token);
		}
	},

	createNonceStr: function () {
		const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		const length = chars.length;

		let str = '';

		for (let i = 0; i < length; i++) {
			str += chars.substr(Math.round(Math.random() * length), 1);
		}
		return str;
	},

	// 从缓存文件里面读取缓存
	readCacheFile: function (filename) {
		try {
			return JSON.parse(fs.readFileSync(filename));
		} catch (e) {
			debug('read file s% failed: s%', filename, e);
		}

		return {}
	},

	// 往文件里面写缓存
	writeCacheFile: function (filename, data) {
		return fs.writeFileSync(filename, JSON.stringify(data));
	}
}

const jssdk = new JSSDK('wx6f22df8564cffc76', 'b156f14eea47479b1320e6911b73a144')
module.exports = jssdk;