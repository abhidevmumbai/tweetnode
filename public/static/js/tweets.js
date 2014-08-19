var socket = null;

var client = {
	tracks_cont: null,
	search_cont: null,
	// server_url: 'http://192.168.0.207:3000/',
	server_url: 'http://localhost:3000/',
	users:[],
	init: function () {
		console.log('Init...');
		// Get the DOM elements
		this.tracks_cont = $('#tracks_cont');
		this.search_cont = $('#search_cont');

		// Initiate the websocket server connection
		this.connectToWebsocket();
		this.bindEvents();
	},

	// Method for handling the websocket server connection and events
	connectToWebsocket: function () {
		if (io !== undefined) {
			// socket = io.connect(this.server_url, { 'forceNew': true });
			socket = io.connect(this.server_url);

			socket.on('connect', function (r) {
				// socket.emit('start trackStream');
				// socket.emit('start search');
			});

			// Stream API new tweet
			socket.on('new tweet', function (tweet) {
				console.log('New tweet');
				client.renderTweet(tweet, client.tracks_cont);
			});

			// Search API tweets
			socket.on('search tweets', function (tweets) {
				console.log('Search tweet results');
				client.renderTweetList(tweets);
			});
		}
	},

	// Method for rendering single tweet object
	renderTweet: function (tweet, container) {
		// console.log(tweet);
        var img = '<img src="' + tweet.user.profile_image_url + '" />',
            elementHtml = '<div class="tweet">'+
							'<a class="pic" href="https://twitter.com/' + tweet.user.screen_name + '" target="_blank">' + img + '</a>'+
							'<span class="text">' + tweet.text + '</span>'+
							'<p class="date">' + tweet.created_at + '</p>'+
						'</div>';
		elementHtml = $(elementHtml);
        
        // A timer to delay the display of tweets as a large amount of tweets are received
        setTimeout(function () {
		container.find('.list').prepend(elementHtml);
				elementHtml.slideDown('fast');
		}, 5000);
    },

    // Method for rendering array of tweets object
    renderTweetList: function (tweets) {
		console.log(tweets);
		for (var index in tweets.statuses) {
			client.renderTweet(tweets.statuses[index], client.search_cont);
		}
		// setInterval(function(){
		// every 1000ms take the oldest tweet of the array and render it
		//	var nextTweet = tweets.statuses.pop();
		//	if (nextTweet) {
		//		client.renderTweet(nextTweet, client.search_cont);
		//	}
		// }, 3000);
    },

    // Method for binding events to the UI elements
	bindEvents: function () {
		$('#streamBtn').click(function (e) {
			e.preventDefault();
			socket.emit('start trackStream');
		});

		$('#searchBtn').click(function (e) {
			e.preventDefault();
			socket.emit('start search');
		});
	}

};

$(document).ready(function () {
	client.init();
});
