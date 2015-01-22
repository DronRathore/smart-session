var express = require("express");
var session = require("../");
var cookie_parser = require("cookie-parser");
var config = {
	"redis" : {
		"ip" : "localhost",
		"db" : 1
	}
}
var app = express();
app.use(cookie_parser());
app.use(session(config));
app.get("/", function(req, res, next){
	if (req.session.loggedIn){
		return res.send("Session is already created");
	} else {
		req.session.add("loggedIn", "true");
		return res.send("New Session created, id="+req.session.id);
	}
})
app.use(function(req, res, next){
	req.session.update();
});
app.listen(9000);