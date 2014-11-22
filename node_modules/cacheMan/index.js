var redis = require("redis")
var cacheMan = function(options){
	if (this instanceof cacheMan){
		this.options = options;
		this.clientLimit = this.options.clientLimit || 20;
		this.currentConnections = {
			bits: []
		};
		this.connections = 0;
	} else {
		return new cacheMan(options);
	}

}
cacheMan.prototype.getClient = function() {
	if (this.currentConnections.bits.length >this.clientLimit){
		return this.lowBound();
	} else {
		this.connections = ++this.connections;
		var client = redis.createClient();
		client.select(this.options.db||1);
		this.currentConnections.bits[this.currentConnections.bits.length] = 1;
		client.__id = this.currentConnections.bits.length-1;
		var self = this;
		client.release = function(id){
			self.release(id);
		};
		this.currentConnections[this.currentConnections.bits.length-1] = client;
		return client;
	}
};
cacheMan.prototype.lowBound = function() {
	var small=Math.min.apply(null, this.currentConnections.bits);
	for (var i=0;i<this.currentConnections.bits.length;i++){
		if (this.currentConnections.bits[i] == small){
			var value = this.currentConnections.bits[i]+1;
			this.currentConnections.bits[i] = value;
			++this.connections;
			return this.currentConnections[i];
		}
	}
};
cacheMan.prototype.release = function(id) {
	--this.connections;
	var value = this.currentConnections.bits[id]-1;
	value = value == -1?0:value;
	this.currentConnections.bits[id] = value;
};
module.exports = cacheMan;