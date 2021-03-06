var socket = null;

var client = {
	tracks_cont: null,
	search_cont: null,
	userList_cont: null,
	// server_url: 'http://192.168.0.207:3000/',
	server_url: 'http://localhost:3000/',
	users: [],
	tweetArray: [], // Stream Tweet array
	tweetDelay: 3000,
	init: function () {
		console.log('Init...');
		// Get the DOM elements
		this.tracks_cont = $('#tracks_cont');
		this.search_cont = $('#search_cont');
		this.userList_cont = $('#userList_cont');
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
				socket.emit('start trackStream');
				// socket.emit('start search');
			});

			// Stream API new tweet
			socket.on('new tweet', function (tweet) {
				console.log('New tweet');
				client.updateTweetsArray(tweet);
			});

			// Search API tweets
			socket.on('search tweets', function (tweets) {
				console.log('Received Search tweet results');
				console.log(tweets);
				client.renderTweetList(tweets.statuses, client.search_cont);
			});

			// Tweets based on the user list
			socket.on('predefined list tweets', function (tweets) {
				console.log('Received predefined list tweet results');
				console.log(tweets);
				client.renderTweetList(tweets, client.userList_cont);
			});

		}
	},

	// Method to update the Tweets Array with the new incoming tweet
	updateTweetsArray: function (tweet) {
		// Adding the new tweet to the start of the array
		this.tweetArray.unshift(tweet);
	},

	// Method for rendering single tweet object
	renderTweet: function (tweet, container) {
        var list = container.find('.list'),
			img = '<img src="' + tweet.user.profile_image_url + '" />',
            elementHtml = '<div class="tweet">'+
							'<a class="pic" href="https://twitter.com/' + tweet.user.screen_name + '" target="_blank">' + img + '</a>'+
							'<span class="text">' + tweet.text + '</span>'+
							'<p class="date">' + tweet.created_at + '</p>'+
						'</div>';
		elementHtml = $(elementHtml);
		list.prepend(elementHtml);
		elementHtml.slideDown('fast');
    },

    // Method for rendering array of tweets object
    renderTweetList: function (tweets, container) {
		// every 1000ms take the oldest tweet of the array and render it first
		setInterval(function(){
			var nextTweet = tweets.pop();
			if (nextTweet) {
				client.renderTweet(nextTweet, container);
			}
		}, client.tweetDelay);
    },

    // Method for binding events to the UI elements
	bindEvents: function () {
		$('#streamBtn').click(function (e) {
			e.preventDefault();
			client.renderTweetList(client.tweetArray, client.tracks_cont);
		});

		$('#searchBtn').click(function (e) {
			e.preventDefault();
			// Taking the search keywords from client
			var keywords = $(this).siblings('.keywords').text();

			socket.emit('start search',{keywords: keywords});
		});

		$('#userDefinedListBtn').click(function (e) {
			e.preventDefault();
			socket.emit('start predefined list tweets');
		});
	}

};

$(document).ready(function () {
	client.init();
});
