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
		if (msg.content.includes("nerd")) {
			msg.react("🤖");
			msg.react("🇳");
			msg.react("🇪");
			msg.react("🇷");
			msg.react("🇩");
		}
		console.log(msg.content);
	}
});



client.login("NzUzNzM5Nzc2MjM4Mjg5MDM3.X1qk3g.-PziSaZ973N8_aahjW5m-WeFgdQ");