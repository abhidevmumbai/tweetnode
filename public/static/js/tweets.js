var socket = io.connect('http://localhost:3000/');

socket.on('connected', function (r) {
	console.log('start stream');
	console.log(r);
	socket.emit('start stream');
});

socket.on('new tweet', function (tweet) {
	console.log('New tweet');
	console.log(tweet);
});