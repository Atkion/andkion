var discord = require('discord.js');
var client = new discord.Client();
//var pT = require('./presence-timer.js');
//var presenceTimer = new pT.Timer(client);


client.on('ready', function () {
	//presenceTimer.startTimer(300000, 600000);
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