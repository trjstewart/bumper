var express = require('express'),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	hasher = require('hash-anything').sha1;

// DB connection
var connection = mongoose.connect('mongodb://bumper:bumpb4hump@128.199.132.173/bumperdb');

// Models
var User = require('./models/user');
var Sti = require('./models/sti');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/register', function (req, res) {

	// var username = req.body.username;
	// var password = req.body.password;

	// var hash = hasher(username.concat(password));

	var user = new User({
		userHash: req.body.userPassHash,
		gender: req.body.gender,
		age: req.body.age,
	});

	user.save(function (err, user) {
		if (!err) res.status(200).send(user);
	});

});

app.post('/login', function (req, res) {
	var hash = req.body.userPassHash;
	User.findOne({'userHash': hash}, function(err, doc) {
		if(doc) {
			res.send({'status': true});
		}
		else {
			res.send({'status': false});
		}
	});
});

app.post('/uniqueHash', function (req, res) {
	var hash = req.body.userPassHash;
	User.findOne({'userHash': hash}, function(err, doc) {
		if(err) {
			res.send({'status': true});
		}
		else { res.send({'status': false}); }
	});

});

app.get('/stilist', function (req, res) {
	Sti.find({}).select('name').exec(function(err, docs) {
		if(!err) {
			var stiNames = docs.map(function(sti) {
				return sti.name;
			});
			res.send(stiNames);
		}
	});
});

app.post('/report', function (req, res) {
	
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});