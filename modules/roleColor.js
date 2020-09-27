var discord = require('discord.js');
const fs = require('fs');
const path = require('path');
let filename = path.resolve('./modules/roleColorWhitelist.json');
let allowed = loadUsers(filename).allowed;
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const filter = (reaction, user) => {
	return (reaction.emoji.name == "✅" || reaction.emoji.name == "❌");
}

function addUser(msg) {
	let role = msg.member.roles.cache.array()[0];
	msg.member.roles.cache.array().forEach(r => { if (r.position > role.position) role = r; });
	let newcolor = msg.content.split(" ")[1];
	msg.guild.roles.create({
		data: {
			name: "Painted",
			color: newcolor,
			position: role.position+1
		},
		reason: "Signup for paintme command"
	})
	.then((role) => { msg.member.roles.add(role); });
	
	allowed.push(msg.author.id);
	let newAllowed = { "allowed": allowed };
	fs.writeFileSync(filename, JSON.stringify(newAllowed));
}
function loadUsers(filename) {
	return JSON.parse(fs.readFileSync(filename).toString());
}

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
		else {
			msg.reply("you aren't on the permission list for this command! Would you like to be?")
			.then( (msg2) => {
				let collector = msg2.createReactionCollector(filter);
				collector.on('collect', (reaction, user) => {
					if (user != msg2.client.user) 
						if (reaction.emoji.name == "✅") {
							addUser(msg);
						}
						else return;
				});
				msg2.react("✅"); 
				msg2.react("❌"); 
			});
		}
	}
}