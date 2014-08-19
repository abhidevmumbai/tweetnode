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
	track_keywords = 'css, html',
	search_keywords = 'html5 since:2013-11-11',
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

	// Using the Stream API with 'track' for multiple keywords
	socket.on('start trackStream', function () {
		console.log('Starting Track stream....');
		if (stream === null) {
			//  filter the twitter public stream by a comma separated list of keywords.
			stream = T.stream('statuses/filter', { track: track_keywords });

			stream.on('tweet', function (tweet) {
				// console.log(tweet);
				// Only broadcast when the users are connected
				if (users.length > 0) {
					// Either we braodast or send it to the user who started the stream
					// socket.emit('new tweet', data);
					socket.broadcast.emit('new tweet', tweet);
				} else {
					// Destroy the stream if no user is connected
					stream = null;
				}

			});
		}
	});


	// Using the Search API
	socket.on('start search', function () {
		stream = null;
		console.log('Starting Search....');
		T.get('search/tweets', { q: search_keywords, count: 20 }, function(err, data, response) {
			// console.log(err);
			// console.log(data);
			socket.emit('search tweets', data);
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


// Method to log total connected users
function logConnectedUsers () {
	console.log('Total users: ' + users.length);
}