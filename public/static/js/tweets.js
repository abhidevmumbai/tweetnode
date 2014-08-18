var socket = null;

var client = {
	tracks_cont: null,
	tweets_cont: null,
	// server_url: 'http://192.168.0.207:3000/',
	server_url: 'http://localhost:3000/',
	users:[],
	init: function () {
		console.log('Init...');
		// Get the DOM elements
		this.tracks_cont = $('#tracks_cont');
		this.tweets_cont = $('#tweets_cont');

		if (io !== undefined) {
			socket = io.connect(this.server_url, { 'forceNew': true });

			socket.on('connect', function (r) {
				// socket.emit('start trackStream');
				socket.emit('start search');
			});

			// Stream API new tweet
			socket.on('new tweet', function (tweet) {
				console.log('New tweet');
				client.renderTweet(tweet);
				console.log(tweet);
			});

			// Search API tweets
			socket.on('search tweets', function (tweets) {
				console.log('Search tweet results');
				client.renderTweetList(tweets);
			});
		}		
	},

	renderTweet: function (tweet) {
		console.log(tweet);
        var img = '<img src="' + tweet.user.profile_image_url + '" />',
            elementHtml = '<div class="tweet">'
		        				+ '<a href="https://twitter.com/' + tweet.user.screen_name + '" target="_blank">' + img + '</a>'
		        				+ '<span>' + tweet.text + '</span>'
		        			+ '</div>';
        this.tweets_cont.prepend(elementHtml);
    },

    renderTweetList: function (tweets) {
		console.log(tweets);
		// for (index in tweets.statuses) {
		// 	setTimeInterval(function () { this.renderTweet(tweets.statuses[index]); }, 500);
		// }
    }
}

$(document).ready(function () {
	client.init();	
});
