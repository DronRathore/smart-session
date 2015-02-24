var cacheMan	= require("./cacheMan");
var Cookies		= require("cookies");
var crypto		= require("crypto");
var session = module.exports = function(config){
	var map = "abcdABCDEklmnopMNOPQR12345.STUVWXYZefghijFGHIJKLqrstuvwxyz06789_";
	var getSecret = function(randomBits){
		var length = map.length;
		var keyName = "";
		while(randomBits/length>0){
			keyName += map[randomBits%length];
			randomBits = Math.floor(randomBits/length);
		}
		keyName += map[randomBits];
		return keyName;
	}
	if (config.redis){
		var ip		= config.redis.ip?config.redis.ip:"127.0.0.1";
		var port	= config.redis.port?config.redis.port:undefined;
		var db		= config.redis.db?config.redis.db:undefined;
	}
	var cName	= config.session&&config.session.cookieName?config.session.cookieName:"_apocalypse";
	var cacheBoy = new cacheMan(config);
	return function(request, response, next){
		var cookies = new Cookies(request, response);
		var redis = cacheBoy.getClient();
		request.session =  request.session || {};
		request.session.___redis = redis;
		var callMeBack = function(err, data){
							if (err)
								console.log("SESSION_STORAGE_FAILED", err);
						}
		request.session.add = function(key, value){
			this[key] = value;
			var copy = {};
			for (key in this)
				if (key!="___redis")
					copy[key] = this[key]
			var sessionData = JSON.stringify(copy);
			this.___redis.set(this.id, sessionData, callMeBack);
			return this;
		}
		request.session.remove = function(key){
			this[key] = undefined;
			var copy = this;
			var copy = {};
			for (key in this)
				if (key!="___redis")
					copy[key] = this[key]
			var sessionData = JSON.stringify(copy);
			this.___redis.set(this.id, sessionData, callMeBack);
		}
		request.session.update = function(){
			var copy = {};
			for (key in this)
				if (key!="___redis")
					copy[key] = this[key]
			var sessionData = JSON.stringify(copy);
			this.___redis.set(this.id, sessionData, callMeBack);
			this.___redis.release(this.___redis.__id);
		}
		request.session.release = function(){
			this.___redis.release(this.___redis.__id);
		}
		if (cookies.get(cName)){
			request.session.id = cookies.get(cName);
			redis.get(request.session.id, function(error, data){
				if (error){
					request.session = undefined;
					next(error);
				} else {
					var sessionData = JSON.parse(data);
					for (keys in sessionData)
						request.session[keys] = sessionData[keys];
					next();
				}
			});
		} else {
			/*
				Generate a Session ID
			*/
			request.session.id	= crypto.randomBytes(25).toString('base64').replace(/\/|\+|\=/g, "")+"-"+crypto.randomBytes(25).toString('base64').replace(/\/|\+|\=/g, "") + "_" + getSecret(Math.floor(Math.random(20)*20));
			cookies.set(cName, request.session.id, {httpOnly:true, expires: {toUTCString:function(){return "";}}});
			next();
		}
	}
}
