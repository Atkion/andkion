const cases = {
	"bong": {
		authorId: null,
		guildId: null,
		fn: function (msg) { msg.react("🔔"); }
	},
	"honk": {
		authorId: "579099931542028299",
		guildId: "702547042412658811",
		fn: function(msg) { msg.react(msg.channel.guild.emojis.cache.get('705668684026216488')); }
	},
	"nerd": {
		authorId: "283400544687489034",
		guildId: "702547042412658811",
		fn: function(msg) {
			msg.react(msg.channel.guild.emojis.cache.get('753806350601158777'));
			msg.react("🇳");
			msg.react("🇪");
			msg.react("🇷");
			msg.react("🇩");
		}
	}
}
	
exports.Handler = class {
	constructor(client) {
		this.client = client;
	}
	
	parse(msg) {
		let hits = [];
		Object.keys(cases).forEach(key => {
			if (msg.content.includes(key)) {
				hits.push(key);
			}
		});
		hits.sort((a, b) => (msg.content.indexOf(a) > msg.content.indexOf(b)) ? 1 : -1);
		hits.forEach(hit => {
			if (!(cases[hit].authorId || cases[hit].guildId)) 
				cases[hit].fn(msg);
			else if (msg.guild && cases[hit].authorId == msg.author.id && cases[hit].guildId == msg.guild.id)
				cases[hit].fn(msg);
			else return;
		});
	}
};