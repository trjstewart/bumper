var express = require('express'),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	hasher = require('hash-anything').sha1,
	async = require('async');

// DB connection
var connection = mongoose.connect('mongodb://bumper:bumpb4hump@128.199.132.173/bumperdb');

// Models
var User = require('./models/user');
var Sti = require('./models/sti');
var Ping = require('./models/ping');
var Bump = require('./models/bump');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/register', function (req, res) {

	// var username = req.body.username;
	// var password = req.body.password;

	var hash = hasher(req.body.user.name);
	var user;

	async.series([
		function(callback) {
			User.findOne({'userHash': hash}, function(err, doc) {
				if(doc) {
					user = doc;
				}
				else {
					callback();
				}
			});
		},
		function(callback) {
			var user = new User({
				userHash: hash,
				gender: req.body.user.gender,
				age: req.body.user.age,
			});

			user.save(function (err, user) {
				if (!err) user = user;
			});

		},
		], function(err) {
      	if (err) return next(err);
      	res.send(user);
			});

	// var user = new User({
	// 	userHash: req.body.userPassHash,
	// 	gender: req.body.gender,
	// 	age: req.body.age,
	// });

});

app.post('/login', function (req, res) {
	var hash = hasher(req.body.user.name);
	User.findOne({'userHash': hash}, function(err, doc) {
		if(doc) {
			res.send({'status': true, 'userID': hash});
		}
		else {
			res.send({'status': false});
		}
	});
});

app.post('/uniqueHash', function (req, res) {
	var hash = hasher(req.body.hash);
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

app.post('/ping', function (req, res) {
	var hash = req.body.hash;
	var user1;
	var user2;

	async.series([
		function(callback) {
			var ping = new Ping({
				userHash: hash,
			});

			ping.save(function (err, ping) {
				if (!err) {
					callback();
				}
			});
		},
		function(callback) {
			Ping.count({}, function(err, count) {
				if (count === 2) {
					callback();
				}
			});
		},
		function(callback) {
			Ping.find({}).sort('-dateTime').limit(2).exec(function(err, docs) {
				user2 = docs[0].userHash;
				user1 = docs[1].userHash;
				callback();
			});
		},
		function(callback) {
			Ping.remove({}, function(err) {
				if (!err) callback();
			});
		},
		function(callback) {
			var bump = new Bump({
				user1: user1,
				user2: user2,
			});

			bump.save(function (err, bump) {
			});

		},
		], function(err) {
      	if (err) return next(err);
			});

});

app.post('/report', function (req, res) {

});

var server = app.listen(5000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
