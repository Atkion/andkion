var discord = require('discord.js');
var client = new discord.Client();
var watcher = require('./watcher.js');
var presenceTimer = new watcher.Timer(client);


client.on('ready', function () {
	presenceTimer.startTimer(10000, 20000);
	console.log('Logged in as "' + client.user.tag + '".');
});

client.on('message', function (msg) {
	if (msg.author.id == "283400544687489034") {
		if (msg.content.toLowerCase().includes("nerd")) {
			msg.react(msg.channel.guild.emojis.cache.get('753806350601158777'));
			msg.react("🇳");
			msg.react("🇪");
			msg.react("🇷");
			msg.react("🇩");
		}
		console.log(msg.content);
	}
	if (msg.author.id == "579099931542028299" && msg.content.toLowerCase().includes("honk")) {
		console.log(msg.content);
		let guild = msg.channel.guild;
		let emojis = guild.emojis;
		msg.react(emojis.cache.get('705668684026216488'));
	}
});



client.login("NzUzNzM5Nzc2MjM4Mjg5MDM3.X1qk3g.-PziSaZ973N8_aahjW5m-WeFgdQ");