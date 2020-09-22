let allowed = ['273563217790238720', '176821190344704001'];

exports.Painter = class {
	constructor(client) { this.client = client; }
	roleColor(msg) {
		if (allowed.includes(msg.author.id)) {
			let color = msg.content.split(" ")[1];
			if (color) {
				msg.member.roles.cache.array()[0]
				.setColor(color, "By User Request")
				.then(msg.react("✅"));
			}
		}
	}
	
}