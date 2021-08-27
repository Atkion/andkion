var discord = require('discord.js');
const fs = require('fs');
const path = require('path');
let filename = path.resolve('./config.json');
let config = require('../config.json');
let allowed;
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
const Colors = {
  DEFAULT: 0x000000,
  WHITE: 0xffffff,
  AQUA: 0x1abc9c,
  GREEN: 0x57f287,
  BLUE: 0x3498db,
  YELLOW: 0xfee75c,
  PURPLE: 0x9b59b6,
  LUMINOUS_VIVID_PINK: 0xe91e63,
  FUCHSIA: 0xeb459e,
  GOLD: 0xf1c40f,
  ORANGE: 0xe67e22,
  RED: 0xed4245,
  GREY: 0x95a5a6,
  NAVY: 0x34495e,
  DARK_AQUA: 0x11806a,
  DARK_GREEN: 0x1f8b4c,
  DARK_BLUE: 0x206694,
  DARK_PURPLE: 0x71368a,
  DARK_VIVID_PINK: 0xad1457,
  DARK_GOLD: 0xc27c0e,
  DARK_ORANGE: 0xa84300,
  DARK_RED: 0x992d22,
  DARK_GREY: 0x979c9f,
  DARKER_GREY: 0x7f8c8d,
  LIGHT_GREY: 0xbcc0c0,
  DARK_NAVY: 0x2c3e50,
  BLURPLE: 0x5865f2,
  GREYPLE: 0x99aab5,
  DARK_BUT_NOT_BLACK: 0x2c2f33,
  NOT_QUITE_BLACK: 0x23272a,
};

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
	
	if (newcolor) {
		let valid = true;
		try { resolveColor(newcolor); } 
		catch(err) { 
			msg.channel.send("Error. Invalid color code, perhaps? ("+err+")"); 
			valid = false;
		}
		if (valid) {
			msg.guild.roles.create({
				name: "Painted",
				color: newcolor,
				position: role.position+1,
				reason: "Signup for paintme command"
			})
			.then((newRole) => { 
				msg.member.roles.add(newRole); 
			});
			allowed.push(msg.author.id);
			config.roleColorWhitelist[msg.guildId] = allowed;
			fs.writeFileSync(filename, JSON.stringify(config, null, 2));
		}
	}
	
	
		//console.log("Comparison of old highest role to new Painted role: "+role.comparePositionTo(newRole));
}
function loadUsers(guildId) {
	return config.roleColorWhitelist[guildId];
}
function resolveColor(color) {
    if (typeof color === 'string') {
      if (color === 'RANDOM') return Math.floor(Math.random() * (0xffffff + 1));
      if (color === 'DEFAULT') return 0;
      color = Colors[color] ?? parseInt(color.replace('#', ''), 16);
    } else if (Array.isArray(color)) {
      color = (color[0] << 16) + (color[1] << 8) + color[2];
    }

    if (color < 0 || color > 0xffffff) throw new RangeError('COLOR_RANGE');
    else if (Number.isNaN(color)) throw new TypeError('COLOR_CONVERT');

    return color;
}

exports.Painter = class {
	constructor(client) { this.client = client; }
	roleColor(msg) {
		allowed = loadUsers(msg.guildId);
		if (!allowed) allowed = [];
		if (allowed.includes(msg.author.id)) {
			let color = msg.content.split(" ")[1];
			let role = msg.member.roles.cache.first();
			let valid = true;
			if (color) {
				try { resolveColor(color); } 
				catch(err) { 
					msg.channel.send("Error. Invalid color code, perhaps? ("+err+")"); 
					valid = false;
				}
				if (valid) {
					msg.member.roles.cache.each(r => { if (r.position > role.position) role = r; /*console.log(r.position + " " + r.name);*/});
					role.setColor(color, "By User Request")
					.then(msg.react("✅"));
				}
				
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