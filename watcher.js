exports.Timer = class {
	constructor(client) {
		this.client = client;
		this.timer;
	}
	startTimer(minTime, maxTime) {
		this.stopTimer();
		var self = this;
		function timeLoop(client) {
			var users = client.users.cache.array();
			var viable = [];
			for (var i = 0; i < users.length; i++) {
				if (users[i] && users[i].username && !users[i].bot)
					viable.push(users[i]);
			}
			if (viable.length) {
				var chosen = viable[Math.floor(Math.random() * viable.length)];
				var data = {
					status: "idle",
					activity: {
						name: chosen.username,
						type: "WATCHING"
					}
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