var socket = io.connect('http://localhost:3000/');

socket.on('new tweet', function (tweet) {
	console.log('New tweet');
	console.log(tweet);
});