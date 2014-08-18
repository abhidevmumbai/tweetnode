var client = {
	tracks_cont: null,
	tweets_cont: null,
	server_url: 'http://localhost:3000/',
	socket: null,
	users:[],
	init: function () {
		// Get the DOM elements
		this.tracks_cont = $('#tracks_cont');
		this.tweets_cont = $('#tweets_cont');

		if (io !== undefined) {
			socket = io.connect(this.server_url);

			socket.on('connected', function (r) {
				console.log('start stream');
				console.log(r);
				socket.emit('start stream');
				// socket.emit('start search');
			});

			socket.on('new tweet', function (tweet) {
				console.log('New tweet');
				client.renderTweet(tweet);
				console.log(tweet);
			});
		}		
	},

	renderTweet: function (tweet) {
        var img = '<img src="' + tweet.user.profile_image_url + '" />',
            link = '<a href="https://twitter.com/' + tweet.user.screen_name + '" target="_blank">' + img + '</a>',
            elementHtml = '<div class="tweet">' + link + '</div>';
        this.tweets_cont.append(elementHtml);
    }
}

$(document).ready(function () {
	client.init();	
});
