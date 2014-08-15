if (!process.env.NODE_ENV) process.env.NODE_ENV='development'

var express = require('express'),
	util = require('util'),
	http = require('http'),
	twitter = require('ntwitter'),
	port = process.env.PORT || 3000;

// Twitter account configuration
var twit = new twitter({
		consumer_key: 'v7PaG6aaPvtmdAo6VnSNeTHC8',
		consumer_secret: 't0jUYGdI8R9GtimQxpo6PLgHgB6kvbpNpnrNzB8Z0BxeCUQ5DB',
		access_token_key: '89122938-tBIb72limYikzyAGpRPlTWOm4ofYHp4SQZRmWEkG9',
		access_token_secret: 'l8FjFLsJNcmhvlO963rrDixVbowr7buR0ZkIZUSsM81uE'
	}),
	stream = null,
	track = "football",
	users = [];

// Init app
var app = express();

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
	// Initialize Passport!  Also use passport.session() middleware, to support
	// persistent login sessions (recommended).
	// app.use(passport.initialize());
	// app.use(passport.session());
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
		console.log('User connected ' + socket.id);
	}

	socket.on('start stream', funcion () {
		if (stream === null) {
			tw.stream("statuses/filter", {
				track: track
			}, function (s) {
				stream = s;

				stream.on('data', function (data) {
					// Only broadcast when the users are connected
					if (users.length >0) {
						// Either we braodast or send it to the user who started the stream
						// socket.emit('new tweet', data);
						socket.broadcast.emit('new tweet', data);
					} else {
						// Destroy the stream if no user is connected
						stream.destroy();
						stream = null;
					}
				});

				stream.on('end', function (response) {
					// Handle a disconnection
				});

				stream.on('destroy', function (response) {
					// Handle a 'silent' disconnection from Twitter, no end/error event fired
				});

				// Disconnect stream after five seconds
				setTimeout(stream.destroy, 5000);
			});
		}
	});

	// User disconnected
	socket.on('disconnect', function () {
		// find and remove the user from the user array
        var index = users.indexOf(socket.id);
        if(index != -1) {
            // Eliminates the user from the array
            users.splice(index, 1);
        }
	});
});