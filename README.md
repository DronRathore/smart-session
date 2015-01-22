smart-session
=============

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/DronRathore/smart-session?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

An ExpressJS Middleware which manages your Session Hassle with a horizontal scaling factor.

##How to use

```javascript
var express = require("express")
var session = require("smart-session");
var app = express();
var config = {
    "redis":{
      "ip": "0.0.0.0",
    },
    "session":{
      "cookieName": "someCoolSessionCookieName" // doesn't matter if you don't give one
    }
}
app.use(session(config));
app.get("/winkCat/:catName", function(request, response){
    if (request.params.catName == "LittleWayne"){
      request.session.add("auth", {"name":"Wayne", wink: true});
      request.session.add("canWink", true);
    }
    if (request.session.canWink){
      response.json({
          "message" : "Oh My Love!"
      });
    } else {
      response.json({
        "message" : "You ain't shit!"
      });
    }
  request.session.update(); //donot forget to do this at the end of each request to achieve scaling! 
}
```
Well that was just an old fashioned way, isn't it? Lets be smart!
```javascript
var express = require("express")
var session = require("smart-session");
var app = express();
var config = {
    "redis":{
      "ip": "0.0.0.0",
    },
    "session":{
      "cookieName": "somethingWhichSoundsLikeMIAgentName" // if not then I have a default one
    }
}
app.use(session(config));
app.get("/winkCat/:catName", function(request, response){
    if (request.params.catName == "BruceWayne"){
      request.session.auth = {"name":"DirtyCat", wink: true};
      request.session.canWink =  true;
    }
    if (request.session.canWink){
      response.json({
          "message" : "Oh My Love!"
      });
    } else {
      response.json({
        "message" : "You ain't shit!"
      });
    }
}
app.use(function(req, res, next){
  request.session.update(); // Add this and just stay cool!
  next();
});
```
##Methods
####request.session.add(key, value)
Where Key can be any text value and Value, Well value can be anything, JSON object, buffer, I don't know whatever you wanna save.
####request.session.update()
Well, when you are done messing up with the session variable, just hit this function and it will save all your mess in a gentle way
###request.session.remove(key)
C'mon, the name reads the whole, remove a session variable
###request.session.destroy()
```
Satan = Initialise->Satan()
Satan->KillTheSession()
```
####Scaling
```javascript
var config = {
    "redis": {
        // That Old Monk Details
    },
    clientLimit: someIntegerValueThatDefinesYourScaling //Wooh! That's too long
}
```
##ToDos
 - Add a hashing algo
 - Redis authentication(a bit lazy will do in few weeks)
 - More Fun!
