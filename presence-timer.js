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
				if (presence.activities[0] && presence.activities[0].type == ('PLAYING' || 'LISTENING' || 'WATCHING' || 'STREAMING')) 
					presences.push(presence);
			}
			if (presences.length) {
				var presence = presences[Math.floor(Math.random() * presences.length)];
				if (presence.activities[0].type == 'LISTENING') console.log(presence);
				var data = {
					status: 'idle',
					activity: {
						application: presence.applicationID,
						name: presence.activities[0].name,
						type: presence.activities[0].type,
						url: presence.activities[0].url
					}
				};
				client.user.setPresence(data);
				//client.user.setActivity(presence.activities[0].name)
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

/*Activity {
      name: 'Spotify',
      type: 'LISTENING',
      url: null,
      details: "I Didn't Know",
      state: 'Skinshape',
      applicationID: null,
      timestamps: [Object],
      party: [Object],
      assets: [RichPresenceAssets],
      syncID: '0tG7g65TWC8rw2xkdLjf6X',
      flags: [ActivityFlags],
      emoji: null,
      createdTimestamp: 1599787919340
    }*/
/*Activity {
      name: 'pancake.gg | p!help',
      type: 'PLAYING',
      url: null,
      details: null,
      state: null,
      applicationID: null,
      timestamps: null,
      party: null,
      assets: null,
      syncID: undefined,
      flags: [ActivityFlags],
      emoji: null,
      createdTimestamp: 1599440040284
    }*/