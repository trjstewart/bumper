var express = require('express'),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	hasher = require('hash-anything').sha1;

// DB connection
var connection = mongoose.connect('mongodb://bumper:bumpb4hump@128.199.132.173/bumperdb');

var User = require('./models/user');

var app = express();

app.use(bodyParser);

app.post('/register', function (req, res) {

	// var username = req.body.username;
	// var password = req.body.password;

	// var hash = hasher(username.concat(password));

	mongoose.model("user").create({
		userHash: req.body.userPassHash,
		gender: req.body.gender,
		age: req.body.age,
	}, function(err, user) {
		if (!err) res.status(200).send(user);
	});

});

app.post('/isUnique', function (req, res) {
	
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});