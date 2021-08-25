const Discord = require('discord.js');
const dVoice = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
let config = require('../config.json');

let audio;
let voiceChannel;
let statusChannel;
let fileData;
let nowPlayingMessage;
let connection;
let audioPlayer;
let audioResource;

function playAudio(client) {
	  audioPlayer = dVoice.createAudioPlayer();
	  joinChannel(client);
	  
	  connection.subscribe(audioPlayer);
	  
	  //Rewrite this please, this shit sucks
	  let files = fs.readdirSync('./modules/music');
	  for (file in files) {
		  
	  }
	  while (true) {
		  audio = files[Math.floor(Math.random() * files.length)];
		  if (audio.endsWith('.mp3')) {
			break;
			}
	  }
	  
	  audioPlayer.on('error', error => {
			console.error('Error:', error.message, 'with track', error.resource.metadata.title);
		});
	  
	  
	  let audioResource = dVoice.createAudioResource(path.join(__dirname, 'music', audio));
	  console.log("Now playing "+path.join(__dirname, audio));
	  audioPlayer.play(audioResource);
		
	}
		
		
function joinChannel (client) {
	  voiceChannel = client.channels.cache.get(config.voiceChannel);
	  if (!voiceChannel) return console.error('The voice channel does not exist!\n(Have you looked at your configuration?)');
	  let joinConfig = {
		  channelId: config.voiceChannel,
		  guildId: config.voiceGuild,
		  adapterCreator: voiceChannel.guild.voiceAdapterCreator,
		  selfDeaf: true,
		  selfMute: false
	  }
	  
	  //if (connection) connection.rejoin(joinConfig);
	  connection = dVoice.joinVoiceChannel(joinConfig);
	}
function leaveChannel(client) {
	try { 
		joinChannel(client);
		connection.destroy(); 
		}
	catch(err) { console.log(err) }
}

exports.Music = class {
	constructor(client) {
		this.client = client;
	}
	action(act) {
		if (act == 'join') joinChannel(this.client);
		//if (act == 'playing') return fileData;
		if (act == 'play') playAudio(this.client);
		if (act == 'resume') if (audioPlayer) audioPlayer.unpause();
		if (act == 'pause') if (audioPlayer) audioPlayer.pause();
		if (act == 'skip') { playAudio(this.client); }
		if (act == 'leave')  { leaveChannel(this.client); }
	}
}