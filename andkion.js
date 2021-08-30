var discord = require('discord.js'); 
var client = new discord.Client({ intents: new discord.Intents(4063) }); //Discord libraries
var config = require('./config.json'); //importing config file
var watcher = require('./modules/watcher.js'); var presenceTimer = new watcher.Timer(client); //Watcher module setup
var emojiHandler = require('./modules/emojiHandler.js'); var emojihandler = new emojiHandler.Handler(client); //Emoji reaction handler setup
var evilHangman = require('./modules/evilHangman.js'); let hangman = new evilHangman.hangman(client); //EvilHangman setup, currently broken
var roleColor = require('./modules/roleColor.js'); var painter = new roleColor.Painter(client); //RoleColor setup
var moderator = require('./modules/autoMod.js'); var autoMod = new moderator.AutoMod(client);
//AutoMod setup, mostly just a placeholder for any future funtionality I want here.

var musicPlayer = require('./modules/musicPlayer.js'); 
var musicModules = [];
var music = new musicPlayer.Music(client); //Music setup

client.on('ready', function () {
	//Module that makes it 'watch' random guild members
	presenceTimer.startTimer(20000, 40000);
	console.log('Logged in as "' + client.user.tag + '".');
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;
	//Music command handling
	let musicCommands = ["clear", "join", "leave", "pause", "play", "playing", "resume", "shuffle", "skip", "queue", "playlists"];
	if (musicCommands.includes(interaction.commandName)) {
		await interaction.deferReply();
		let music;
		musicModules.forEach((module) => {
			if (module.getGuildId() == interaction.guildId) music = module;
		});
		if (!music) {
			music = new musicPlayer.Music(client, interaction.guildId);
			musicModules.push(music);
		}
		await interaction.editReply({ 
			content: " ", embeds: [new discord.MessageEmbed({
				description: await music.action(interaction.commandName, interaction),
				color: "#A14545"
			})]
		});
	}
	//Any other slash command handling goes here, none so far
});

client.on('messageCreate', function (msg) {
	//Emoji Handler
	emojihandler.parse(msg);
	
	//AutoMod processing
	autoMod.parse(msg);
	
	//Evil Hangman thing (Currently broken, somehow it can't read dictionary.txt and I'm not fixing it for a 3rd time fuck you)
	/*if (msg.content.includes("hang me a man")) {
		let size = parseInt(msg.content.match(/\d+/), 10);
		msg.reply("Loading hangman...").then(msg => hangman.startGame(msg, size));
	}*/
	
	//Role Color command
	if (msg.content.startsWith("paintme")) painter.roleColor(msg);
	
});

	

client.login(config.token);






//Post the slash command for music purposes

/*client.login(config.token).then( async () => {
let joinC = {
	name: "join",
	description: "Joins your voice channel."
}
let playingC = {
	name: "playing",
	description: "Displays the current song."
}
let playC = {
	name: "play",
	description: "Plays a song or playlist, or adds it to the queue if something is playing already.",
	options: [{
		name: "media",
		type: 3,
		description: "Can be a youtube link, spotify link, local playlist name, or a youtube search string.",
		required: true
	}]
}
let resumeC = {
	name: "resume",
	description: "Resumes a song after being paused."
}
let pauseC = {
	name: "pause",
	description: "Pauses a song so it can be resumed later."

}
let skipC = {
	name: "skip",
	description: "Skips to the next song in the queue.",
	options: [{
		name: "number",
		description: "The number of songs to skip (default 1). If you skip past the queue, it will restart.",
		type: 4,
		required: false
	}]
}
let leaveC = {
	name: "leave",
	description: "Forces the bot to leave the voice channel."
}
let shuffleC = {
	name: "shuffle",
	description: "Sets auto-shuffle. If enabled, the queue will immediately shuffle and then reshuffle upon loop.",
	options: [{
		name: "set",
		type: 5,
		description: "The setting to apply (true/false)",
		required: true
	}]
}
let clearC = {
	name: "clear",
	description: "Forcibly clears the queue."
}
let queueC = {
	name: "queue",
	description: "Shows the next 5 songs in the queue. Can be pretty slow."
}
let playlistC = {
	name: "playlists",
	description: "Lists local playlists. Note that this is atkion's local music, you probably won't care."
}
let commands = [joinC, playingC, playC, resumeC, pauseC, skipC, leaveC, shuffleC, clearC, queueC, playlistC];

let cMan = await client.guilds.cache.get('351512022283976715').commands.set(commands);
console.log(cMan);
});*/

