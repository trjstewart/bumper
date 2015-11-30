var express = require('express'),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	hasher = require('hash-anything').sha1,
	async = require('async'),
	uniques = require('uniques'),
	request = require('request'),
	ionicPushServer = require('ionic-push-server'),
	btoa = require('btoa'),
	exec = require('child_process').exec;

// DB connection
var connection = mongoose.connect('mongodb://bumper:bumpb4hump@128.199.132.173/bumperdb');

// Models
var User = require('./models/user');
var Sti = require('./models/sti');
var Ping = require('./models/ping');
var Bump = require('./models/bump');
var Report = require('./models/report');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(function(req, res, next) {
	 res.header("Access-Control-Allow-Origin", "*");
	 res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	 next();
});

var credentials = {
    IonicApplicationID : "b412dc5b",
    IonicApplicationAPIsecret : "3ca8040a8c49260adf3d9a27f1299b01121b959a22f2114b"
};

app.post('/register', function (req, res) {

	// var username = req.body.username;
	// var password = req.body.password;

	var userObj = req.body.user;
	var hash = hasher(userObj.name);
	var user;

	async.series([
		function(callback) {
			User.findOneAndUpdate({'userHash': hash}, { deviceToken: userObj.deviceToken }, {}, function(err, doc) {
				if(doc) {
					user = doc;
					res.send(user);
				}
				else {
					callback();
				}
			});
		},
		function(callback) {
			var user = new User({
				userHash: hash,
				gender: userObj.gender,
				age: userObj.age,
				deviceToken: userObj.deviceToken,
			});

			user.save(function (err, user) {
				if (!err) user = user;
				res.send(user);
			});

		},
		], function(err) {
      	if (err) return next(err);
			});

	// var user = new User({
	// 	userHash: req.body.userPassHash,
	// 	gender: req.body.gender,
	// 	age: req.body.age,
	// });

});

app.post('/login', function (req, res) {
	var userObject = req.body.user;
	var hash = hasher(userObject.name);
	User.findOneAndUpdate({'userHash': hash}, { deviceToken: userObject.deviceToken }, {}, function(err, doc) {
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

	res.send('Happy Humping');

});

app.post('/report', function (req, res) {
	var userObj = req.body.user;
	var hashes = [];
	var tokens = [];
	var count = 0;


	async.series([
		// function(callback) {

		// 	var report = new Report({
		// 		userHash: userObject.hash,
		// 		sti: userObject.sti,
		// 		days: userObject.days,
		// 	});

		// 	report.save(function (err, report) {
		// 		if (!err) callback();
		// 	});

		// },
		function(callback) {

			Bump.find({'user1': userObj.hash}, function(err, docs) {
				if(docs) {
					for (var i=0; i<docs.length; i++) {
						hashes.push(docs[i].user2);
					}

					Bump.find({'user2': userObj.hash}, function(err, docs) {
						if(docs) {
							for (var i=0; i<docs.length; i++) {
								hashes.push(docs[i].user1);
							}
							hashes = uniques(hashes);
							callback();
						}
					});
					
				}
			});

		},
		function(callback) {

			for (var i=0; i< hashes.length; i++) {
				User.findOne({'userHash': hashes[i]}, function(err, doc) {
					if(!err) {
						if (doc.deviceToken) {
							tokens.push(doc.deviceToken);	
						}
						count++;
					}
					if (count == (hashes.length)) {
						//console.log('');
						callback();
					}
				});
			}

		},
		function(callback) {

			console.log(tokens);

			var notification = {
			  "tokens": [],
			  "notification": {
			    "alert":"Sorry you might have an STI, Please get a check.",
			  }
			};

			if(tokens.length != 0) {

				for (var i=0; i < tokens.length; i++) {
					notification.tokens = Array(tokens[i]);
					//console.log(notification);
					ionicPushServer(credentials, notification);
				}

			}

		},
		], function(err) {
      	if (err) return next(err);
			});

		res.send('Oh, SHIT!');
});

app.post('/updatedevicetoken', function(req, res) {
	var user = req.body.user;
	var conditions = {userHash: user.hash};
	var update = {deviceToken: user.token};
	var options = {};
	User.update(conditions, update, options, function(err, numAffected) {
		console.log('Updated ' + user.hash + ' with a new id of ' + user.token);
		res.send('Users ID has been bumped!');
	});
});

var server = app.listen(5000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
