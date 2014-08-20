if (!process.env.NODE_ENV) process.env.NODE_ENV='development';

var express = require('express'),
	util = require('util'),
	http = require('http'),
	twitter = require('twit'),
	port = process.env.PORT || 3000;

// Twitter account configuration
var T = new twitter({
		consumer_key: 'v7PaG6aaPvtmdAo6VnSNeTHC8',
		consumer_secret: 't0jUYGdI8R9GtimQxpo6PLgHgB6kvbpNpnrNzB8Z0BxeCUQ5DB',
		access_token: '89122938-tBIb72limYikzyAGpRPlTWOm4ofYHp4SQZRmWEkG9',
		access_token_secret: 'l8FjFLsJNcmhvlO963rrDixVbowr7buR0ZkIZUSsM81uE'
	}),
	stream = null,
	language = 'en',
	track_keywords = 'nrl, nba, nfl',
	search_keywords = 'html5 since:2013-11-11',
	friends_list = null,
	friends_obj_list = null,
	predefined_lists = [],
	predefined_obj_lists= null,
	users = [];

// Init app
var app = express(),
	stream = null;

// configure Express
app.configure(function() {
	app.set('port', port);
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.set('views', __dirname + '/public/views');
	app.set('view engine', 'jade');
	app.use(express.logger());
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	// app.use(express.session({ secret: 'keyboard cat' }));
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res){
	res.render('index');
});


// Create the server
var server = http.createServer(app);

server.listen(port, function () {
	console.log('Web server is running in %s environment on port %d', process.env.NODE_ENV, port);
});

/*
	Socket io configuration
*/
// Start the websocket server
var io = require('socket.io').listen(server);

// Listener for client connection
io.sockets.on('connection', function (socket) {
	// Add the user if it doesn't exist in the user array
	if (users.indexOf(socket.id) == -1) {
		users.push(socket.id);
		console.log('User ' + socket.id + ' connected successfully');
		logConnectedUsers();
	}

	//Store the Pre-defined lists
	getPredefinedLists();

	// Store the Friends list
	getFriendsList(socket);

	// Using the Stream API with 'track' for multiple keywords
	socket.on('start trackStream', function () {
		console.log('Starting Track stream....');
		if (stream === null) {
			//  filter the twitter public stream by a comma separated list of keywords.
			stream = T.stream('statuses/filter', { track: track_keywords, language: language });

			stream.on('tweet', function (tweet) {
				// console.log(tweet);
				// Only broadcast when the users are connected
				if (users.length > 0) {
					// Either we braodast or send it to the user who started the stream
					socket.broadcast.emit('new tweet', tweet);
				} else {
					// Destroy the stream if no user is connected
					stream = null;
				}

			});
		}
	});


	// Using the Search API
	socket.on('start search', function (obj) {
		// Update the keywords from the client
		search_keywords = obj.keywords;

		console.log('Starting Search with keywords: ' + search_keywords);

		T.get('search/tweets', { q: search_keywords, count: 5, language: language }, function(err, data, response) {
			// console.log(err);
			// console.log(data);
			socket.emit('search tweets', data);
		});
	});

	// Using the Friends/Following list statuses API
	socket.on('start predefined list tweets', function () {
		// https://api.twitter.com/1.1/lists/statuses.json?slug=teams&owner_screen_name=MLS&count=1
		T.get('lists/statuses', {list_id: 167301778, count: 50}, function(err, data, response) {
			console.log('Fetching Pre-defined lists tweets');
			// console.log(err);
			// console.log(data);
			socket.emit('predefined list tweets', data);
		});
	});
	

	

	// User disconnected
	socket.on('disconnect', function () {
		// find and remove the user from the user array
        var index = users.indexOf(socket.id);
        if(index != -1) {
            // Eliminates the user from the array
            users.splice(index, 1);
        }
        logConnectedUsers();
	});

	// Emits signal when the user is connected sending
    // the tracking words the app it's using
    // socket.emit("connected", {
    //     tracking: track,
    //     search: search_keywords
    // });
});


// API call to get the Users predefined lists ids
function getPredefinedLists (socket) {
	// Empty the array
	predefined_lists = [];
	
	// https://api.twitter.com/1.1/lists/list.json
	T.get('lists/list', function(err, data, response) {
		console.log('Fetching Pre-defined id list...');
		// console.log(err);
		// console.log(data);
		predefined_obj_lists = data;

		// Storing the predefined lists ids in an array
		for (var i in predefined_obj_lists) {
			predefined_lists.push(predefined_obj_lists[i].id);
		}

		console.log(predefined_lists.toString());
	});
}

// API call to get the Users friends/following ids
function getFriendsList (socket) {
	// https://api.twitter.com/1.1/friends/ids.json
	T.get('friends/ids', function(err, data, response) {
		console.log('Fetching Friends id list...');
		// console.log(err);
		// console.log(data);
		friends_list = data;

		// Get the friends/folowing objects list
		getFriendsObjectList(socket);
	});
}

// API call to get the Users friends/following ids
function getFriendsObjectList (socket) {
	// https://api.twitter.com/1.1/friends/ids.json
	T.get('users/lookup', { user_id: friends_list.ids.toString() }, function(err, data, response) {
		console.log('Fetching Friends objects list...');
		// console.log(err);
		// console.log(data);
		friends_obj_list = data;
		socket.emit('friends list', friends_obj_list);
	});
}
	

// Method to log total connected users
function logConnectedUsers () {
	console.log('Total users: ' + users.length);
}