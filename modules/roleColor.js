var discord = require('discord.js');
const fs = require('fs');
const path = require('path');
let filename = path.resolve('./config.json');
let config = require('../config.json');
let allowed;
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const filter = (reaction, user) => {
	return (reaction.emoji.name == "✅" || reaction.emoji.name == "❌");
}

function addUser(msg) {
	let role = msg.member.roles.cache.first();
	msg.member.roles.cache.each(r => { 
		if (r.position > role.position) role = r; 
		//console.log(r.position + " " + r.name);
	});
	let newcolor = msg.content.split(" ")[1];
	msg.guild.roles.create({
		name: "Painted",
		color: newcolor,
		position: role.position+1,
		reason: "Signup for paintme command"
	})
	.then((newRole) => { 
		msg.member.roles.add(newRole); 
		//console.log("Comparison of old highest role to new Painted role: "+role.comparePositionTo(newRole));
	});
	
	
	
	allowed.push(msg.author.id);
	config.roleColorWhitelist[msg.guildId] = allowed;
	fs.writeFileSync(filename, JSON.stringify(config, null, 2));
}
function loadUsers(guildId) {
	return config.roleColorWhitelist[guildId];
}

exports.Painter = class {
	constructor(client) { this.client = client; }
	roleColor(msg) {
		allowed = loadUsers(msg.guildId);
		if (!allowed) allowed = [];
		if (allowed.includes(msg.author.id)) {
			let color = msg.content.split(" ")[1];
			let role = msg.member.roles.cache.first();
			if (color) {
				msg.member.roles.cache.each(r => { if (r.position > role.position) role = r; /*console.log(r.position + " " + r.name);*/});
				role.setColor(color, "By User Request")
				.then(msg.react("✅"));
			}
		}
		else {
			msg.reply("You don't have a Painted role yet! Do you want one?")
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