var express = require('express');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy
var session = require('express-session')
var logger = require('morgan')
var cookieParser = require('cookie-parser')

var user = require("./user.js")

var app = express();
app.use(express.static(__dirname + '/public'))   // set the static files location /public/img will be /img for users
app.use(bodyParser.json()) // for parsing application/json
app.use(logger('combined'))
app.use(cookieParser());
app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());

// routes 
var routes = require('./routes/routes.js');
routes(app, passport, localStrategy, user);

app.use(errorHandler);

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});