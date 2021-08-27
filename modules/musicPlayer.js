const Discord = require('discord.js');
const dVoice = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core'); //Abort issues when playing, but still required for url validation
const youtube = require('play-dl');
let config = require('../config.json');
let filename = path.resolve('./config.json');

let shuffle = (config.shuffle) ? config.shuffle : false;
let voiceChannel;
let statusChannel;
let fileData;
let nowPlayingMessage;

let audio;
let connection;
let audioPlayer;
let audioResource;
let playlistIndex = 0;

let queue = [];
audioPlayer = dVoice.createAudioPlayer();

audioPlayer.on('error', error => {
	console.log('Error:', error.message, 'with track', error.resource);
});
audioPlayer.on('stateChange', (oldState, newState) => {
	if (oldState.status == "playing" && newState.status == "idle") {
		playNextSong();
	}
});

async function playNextSong() {
	if (!queue[0]) return "Nothing in queue. Playback will stop when song ends.";
	
	let mode;
	if (ytdl.validateURL(queue[playlistIndex])) mode = "youtube";
	else if (/*check for local file/playlist*/false) mode = "local";
	
	
	if (mode == "local") {
		await playLocalAudio(queue[playlistIndex]);
	}
	else if (mode == "youtube") {
		await playYoutubeAudio(queue[playlistIndex]);
	}
	playlistIndex++;
	if (playlistIndex == queue.length) playlistIndex = 0;
	if (playlistIndex == 0 && shuffle) shuffleArray(queue);
	return "Now playing "+audio;
}
async function playAudio(client, interaction) {
	joinChannel(client, interaction);
	  
	if (!connection) return "Error. Are you in a voice channel, and is it available to Andkion?";
	connection.subscribe(audioPlayer);
	  
	if (audioPlayer.state.status == "idle") {
		return await queueSongs(interaction.options.get("media").value, interaction)+"\n"+await playNextSong();
	}
	else return await queueSongs(interaction.options.get("media").value, interaction);
	}
async function playLocalAudio(fileAddr) { 
	audio = path.basename(fileAddr);
	audioResource = dVoice.createAudioResource(fileAddr, { inlineVolume: true });
	audioPlayer.play(audioResource);
}	
async function playYoutubeAudio(url) {
	audio = url;
	let yt_info = await youtube.video_info(audio);
	let stream = await youtube.stream_from_info(yt_info);
	audio = yt_info.video_details.title;
	
	audioResource = dVoice.createAudioResource(stream.stream, {inputType: stream.type, inlineVolume: true });
	
	audioPlayer.play(audioResource);
}
async function queueYoutubePlaylist(url) {
	let playlist = await youtube.playlist_info(url);
	playlist = await playlist.fetch();
	playlist.videos.forEach((video) => {
		queue.push(video.url);
	});
	return [playlist.title, playlist.videoCount];
}
async function queueYoutubeSearch(request) {
	let yt_info = await youtube.search(request, {limit: 1});
	queue.push(yt_info[0].url);
	let info = await youtube.video_info(yt_info[0].url);
	return info.video_details.title;
}
async function checkYoutubePlaylistLink(url) {
	try {
		await youtube.playlist_info(url);
		return true;
	}
	catch {
		return false;
	}
}	
async function getTrackName(track) {
	if (ytdl.validateURL(track)) {
		let temp = await youtube.video_info(track);
		return temp.video_details.title;
	}
	else {
		return path.basename(fileAddr);
	}
	return "Error. Not sure what happened here.";
}	
function joinChannel (client, interaction) {
	voiceChannel = client.channels.cache.get(interaction.member.voice.channelId);
	if (!voiceChannel) return "Error. Are you in a voice channel, and is it available to Andkion?";
	
	let joinConfig = {
		  channelId: interaction.member.voice.channelId,
		  guildId: interaction.member.voice.guild.id,
		  adapterCreator: voiceChannel.guild.voiceAdapterCreator,
		  selfDeaf: true,
		  selfMute: false
	  }
	
	if (connection) connection.rejoin(joinConfig);
	else connection = dVoice.joinVoiceChannel(joinConfig);
	return "Channel Joined."
	}
function leaveChannel() {
	if (connection) {
		if (connection.disconnect()) return "Disconnected.";
		else {
			connection.destroy(); 
			return "Could not disconnect, connection destroyed.";
		}
	}
	else return "Connection nonexistant."
}
function pause() {
	if (!audioPlayer) return "Nothing to pause."
	else {
		audioPlayer.pause();
		return "Paused.";
	}
}
function resume() {
	if (!audioPlayer) return "Nothing to resume."
	else {
		audioPlayer.unpause();
		return "Resumed.";
	}
}
function setShuffle(bool) {
	shuffle = bool;
	config.shuffle = bool;
	fs.writeFileSync(filename, JSON.stringify(config, null, 2));
	if (bool) { shuffleArray(queue); }
	return "Queue has been shuffled, and global shuffle has been toggled (now "+bool+").";
}
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
function clear() { 
	queue = []; 
	return "Queue Cleared."
}
async function listQueue() {
	let result = "The next 5 songs in the queue are: \n";
	for (let i = playlistIndex; i<queue.length && i<playlistIndex+5; i++) {
		result = result +(i+1)+": "+await getTrackName(queue[i])+"\n"
	}
	return result;
}
async function queueSongs(input) {
	let numQueued = 1;
	if (ytdl.validateURL(input)) {
		queue.push(input);
		let temp = await youtube.video_info(input);
		input = temp.video_details.title;
	}//Checks for a youtube video
	else if (/*check for spotify playlist*/false) {
		//Queue all songs in spotify pl
	} 
	else if (/*check for spotify link*/false) {
		//Checks for a spotify song
	}
	else if (/*check for local file/playlist*/false) queue.push(input); //get full file addr(s)
	else if (await checkYoutubePlaylistLink(input)) { //Queue all songs in a yt pl
		let result = await queueYoutubePlaylist(input);
		input = result[0]; numQueued = result[1];
	}
	else { 
		input = await queueYoutubeSearch(input); 
	}//Anything else is a youtube search
	return input+" has been queued. ("+numQueued+" song(s))";	
}
exports.Music = class {
	constructor(client) {
		this.client = client;
	}
	async action(act, interaction) {
		if (act == 'join') return joinChannel(this.client, interaction);
		if (act == 'playing') return "Now playing "+audio;
		if (act == 'play') return playAudio(this.client, interaction);
		if (act == 'resume') return resume();
		if (act == 'pause') return pause();
		if (act == 'skip') { return playNextSong(); }
		if (act == 'leave') return leaveChannel(); 
		if (act == 'shuffle') return setShuffle(!shuffle);
		if (act == 'clear') return clear();
		if (act == 'playlists') return "Unfinished Command, try again later or ask atkion";
		if (act == 'queue') return await listQueue();
		return "Invalid command. This should never appear, and is a bug with Andkion. Tell atkion what you did to get this message.";
	}
}