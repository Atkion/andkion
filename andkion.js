var discord = require('discord.js'); var client = new discord.Client(); //Discord libraries
var watcher = require('./watcher.js'); var presenceTimer = new watcher.Timer(client); //Watcher module setup
var emojiHandler = require('./emojiHandler.js'); var handler = new emojiHandler.Handler(client); //Emoji reaction handler setup
var evilHangman = require('./evilHangman.js'); //EvilHangman setup
var roleColor = require('./roleColor.js'); var painter = new roleColor.Painter(client);


client.on('ready', function () {
	presenceTimer.startTimer(20000, 40000);
	console.log('Logged in as "' + client.user.tag + '".');
});

client.on('message', function (msg) {
	handler.parse(msg);
	if (msg.content.includes("hang me a man")) {
		let size = parseInt(msg.content.match(/\d+/), 10);
		let hangman = new evilHangman.hangman(client);
		msg.reply("Loading hangman...").then(msg => hangman.startGame(msg, size));
	}
	if (msg.content.startsWith("paintme")) painter.roleColor(msg);
});



client.login("NzUzNzM5Nzc2MjM4Mjg5MDM3.X1qk3g.-PziSaZ973N8_aahjW5m-WeFgdQ");