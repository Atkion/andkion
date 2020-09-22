let allowed = ['273563217790238720', '176821190344704001', '579099931542028299'];

exports.Painter = class {
	constructor(client) { this.client = client; }
	roleColor(msg) {
		if (allowed.includes(msg.author.id)) {
			let color = msg.content.split(" ")[1];
			let role = msg.member.roles.cache.array()[0];
			if (color) {
				msg.member.roles.cache.array().forEach(r => { if (r.position > role.position) role = r; });
				role.setColor(color, "By User Request")
				.then(msg.react("✅"));
			}
			
		}
	}
	
}