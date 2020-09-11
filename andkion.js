var discord = require('discord.js');
var client = new discord.Client();
var watcher = require('./watcher.js');
var presenceTimer = new watcher.Timer(client);
var emojiHandler = require('./emojiHandler.js');
var handler = new emojiHandler.Handler(client);


client.on('ready', function () {
	presenceTimer.startTimer(20000, 40000);
	console.log('Logged in as "' + client.user.tag + '".');
});

client.on('message', function (msg) {
	handler.parse(msg);
});



client.login("NzUzNzM5Nzc2MjM4Mjg5MDM3.X1qk3g.-PziSaZ973N8_aahjW5m-WeFgdQ");