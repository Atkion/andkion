var discord = require('discord.js'); 
var client = new discord.Client({ intents: new discord.Intents(4063) }); //Discord libraries
var config = require('./config.json');
var watcher = require('./modules/watcher.js'); var presenceTimer = new watcher.Timer(client); //Watcher module setup
var emojiHandler = require('./modules/emojiHandler.js'); var handler = new emojiHandler.Handler(client); //Emoji reaction handler setup
var evilHangman = require('./modules/evilHangman.js'); let hangman = new evilHangman.hangman(client); //EvilHangman setup
var roleColor = require('./modules/roleColor.js'); var painter = new roleColor.Painter(client); //RoleColor setup
var localMusic = require('./modules/localMusic.js'); var music = new localMusic.Music(client); //localMusic setup

client.on('ready', function () {
	//Module that makes it 'watch' random guild members
	presenceTimer.startTimer(20000, 40000);
	console.log('Logged in as "' + client.user.tag + '".');
});

client.on('interactionCreate', (interaction) => {
	if (!interaction.isCommand()) return;
	if (interaction.commandName == 'music') {
		interaction.reply({ content: 'I gotchu homie', ephemeral: true });
		music.action(interaction.options.get('action').value);
	}
});

client.on('messageCreate', function (msg) {
	//Emoji Handler
	handler.parse(msg);
	
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
/*
	let commandInfo = {
		data: { 
			name: "music",
			description: "Utilizes Andkion's Music Module",
			options: [{
				name: "action",
				type: 3,
				description: "The subcommand, check the options",
				required: true,
				choices: [
					{
						name: "join",
						value: "join"
					},
					{	
						name: "play",
						value: "play"
					},
					{
						name: "pause",
						value: "pause"
					},
					{
						name: "resume",
						value: "resume"
					},
					{
						name: "skip",
						value: "skip"
					},
					{
						name: "leave",
						value: "leave"
					}
				]
			}]
		}
	};
	let command = client.api.applications(client.user.id).guilds('702547042412658811').commands.post(commandInfo).then(console.log).catch(console.error);*/
