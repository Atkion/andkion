exports.Timer = class {
	constructor(client) {
		this.client = client;
		this.timer;
	}
	startTimer(minTime, maxTime) {
		this.stopTimer();
		var self = this;
		function timeLoop(client) {
			var users = client.users.cache;
			var viable = [];
			users.each( user => {
				if (user && user.username && !user.bot)
					viable.push(user);
			});
			if (viable.length) {
				var chosen = viable[Math.floor(Math.random() * viable.length)];
				var data = {
					status: "idle",
					activities: [{
						name: chosen.username,
						type: "WATCHING",
						url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
					}]
				};
				client.user.setPresence(data);
			}
			var delay = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
			self.timer = setTimeout(timeLoop, delay, client);
		}
		timeLoop(this.client);
	}
	stopTimer() {
		clearTimeout(this.timer);
		this.timer = undefined;
	}
};