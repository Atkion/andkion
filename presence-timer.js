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
			var presences = [];
			for (var i = 0; i < users.length; i++) {
				let presence = users[i].presence;
				if (presence.game) console.log(presence);/*presences.push(presence);*/
			}
			if (presences.length) {
				var presence = presences[Math.floor(Math.random() * presences.length)];
				client.user.setPresence(presence);
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