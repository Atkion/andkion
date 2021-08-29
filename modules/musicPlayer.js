const Discord = require('discord.js');
const dVoice = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core'); //Abort issues when playing, but still wanted for url validation
const youtube = require('play-dl');
const NodeID3 = require('node-id3');
let config = require('../config.json');
let filename = path.resolve('./config.json');
let musicFolder = path.resolve('../MusicRepo');
let localPlaylists = fs.readdirSync(musicFolder);


exports.Music = class {
	constructor(client, guildId) {
		this.client = client;
		this.guildId = guildId;
		this.shuffle = (config.shuffle[this.guildId]) ? config.shuffle[this.guildId] : false;
		this.voiceChannel;
		this.statusChannel;
		this.fileData;
		this.nowPlayingMessage;

		this.audio;
		this.connection;
		this.audioPlayer;
		this.audioResource;
		this.playlistIndex = 0;

		this.queue = [];
		this.audioPlayer = dVoice.createAudioPlayer();

		this.audioPlayer.on('error', error => {
			console.log('Error:', error.message, 'with track', error.resource);
		});
		this.audioPlayer.on('stateChange', (oldState, newState) => {
			if (oldState.status == "playing" && newState.status == "idle") {
				this.playNextSong();
			}
		});
	
	}
	async playNextSong() {
		if (!this.queue[0]) return "Nothing in queue. Playback will stop when song ends.";
		
		let mode;
		if (path.isAbsolute(this.queue[this.playlistIndex])) mode = "local";
		else if (await this.checkYoutubeVideoLink(this.queue[this.playlistIndex])) mode = "youtube";
		else return "Unknown item in queue. This should not happen, contact atkion.";
	
		if (mode == "local") {
			await this.playLocalAudio(this.queue[this.playlistIndex]);
		}
		else if (mode == "youtube") {
			await this.playYoutubeAudio(this.queue[this.playlistIndex]);
		}
		this.playlistIndex++;
		if (this.playlistIndex >= this.queue.length) this.playlistIndex = 0;
		return "Now playing "+await this.getCurrent();
	}
	async playAudio(client, interaction) {
		this.joinChannel(client, interaction);
		  
		if (!this.connection) return "Error. Are you in a voice channel, and is it available to Andkion?";
		this.connection.subscribe(this.audioPlayer);
		  
		if (this.audioPlayer.state.status == "idle") {
			let response = await this.queueSongs(interaction.options.get("media").value)+"\n";
			if (this.shuffle) this.shuffleArray(this.queue);
			let response2 = await this.playNextSong();
			return response+response2;
		}
		else return await this.queueSongs(interaction.options.get("media").value);
		}
	queueLocalFolder(fileAddr) {
		let files = fs.readdirSync(path.resolve(musicFolder, fileAddr), { withFileTypes: true });
		let numQueued = 0;
		files.forEach( (file) => {
			if (file.isDirectory()) 
				numQueued += this.queueLocalFolder(path.resolve(musicFolder, fileAddr, file.name))[1];
			else if (file.name.endsWith('.mp3')) {
				this.queue.push(path.resolve(musicFolder, fileAddr, file.name));
				numQueued++;
			}
		});
		return [fileAddr, numQueued];
	}
	async playLocalAudio(fileAddr) { 
		this.audio = await this.getTrackName(fileAddr);
		this.audioResource = dVoice.createAudioResource(fileAddr, { inlineVolume: true });
		this.audioPlayer.play(this.audioResource);
	}	
	async playYoutubeAudio(url) {
		this.audio = url;
		let yt_info = await youtube.video_info(this.audio);
		let stream = await youtube.stream_from_info(yt_info);
		this.audio = yt_info.video_details.title;
		
		this.audioResource = dVoice.createAudioResource(stream.stream, {inputType: stream.type, inlineVolume: true });
		
		this.audioPlayer.play(this.audioResource);
	}
	async queueYoutubePlaylist(url) {
		let playlist = await youtube.playlist_info(url,true);
		playlist = await playlist.fetch();
		playlist.videos.forEach((video) => {
			this.queue.push(video.url);
		});
		return [playlist.title, playlist.videoCount];
	}
	async queueYoutubeSearch(request) {
		let yt_info = await youtube.search(request, {limit: 1});
		this.queue.push(yt_info[0].url);
		let info = await youtube.video_info(yt_info[0].url);
		return info.video_details.title;
	}
	async checkYoutubePlaylistLink(url) {
		try {
			await youtube.playlist_info(url, true);
			return true;
		}
		catch(err) {
			//console.log(err);
			return false;
		}
	}
	async checkYoutubeVideoLink(url) {
		if (!url || !url.split('watch?v=')[1]) return false;
		try {
			await youtube.video_info(url);
			return true;
		}
		catch {
			return false;
		}
	}	
	async getTrackName(track) {
		if (path.isAbsolute(track)){
			let tags = NodeID3.read(track);
			return ["`"+((tags.title) ? tags.title : track.split("\\")[track.split("\\").length-1])+"` from `"
				+track.replace(musicFolder, "")
				.replace(track.split("\\")[track.split("\\").length-1], "")+"`", null];
		}
		else if (await this.checkYoutubeVideoLink(track)) {
			let temp = await youtube.video_info(track);
			return [temp.video_details.title, track];
		}
		return "Error. Not sure what happened here.";
	}	
	joinChannel (client, interaction) {
		this.voiceChannel = client.channels.cache.get(interaction.member.voice.channelId);
		if (!this.voiceChannel) return "Error. Are you in a voice channel, and is it available to Andkion?";
		
		let joinConfig = {
			channelId: interaction.member.voice.channelId,
			guildId: interaction.member.voice.guild.id,
			adapterCreator: this.voiceChannel.guild.voiceAdapterCreator,
			selfDeaf: true,
			selfMute: false
		}
		
		if (this.connection) this.connection.rejoin(joinConfig);
		else this.connection = dVoice.joinVoiceChannel(joinConfig);
		return "Channel Joined."
		}
	leaveChannel() {
		if (this.connection) {
			if (this.connection.disconnect()) return "Disconnected.";
			else {
				this.connection.destroy(); 
				return "Could not disconnect, connection destroyed.";
			}
		}
		else return "Connection nonexistant."
	}
	pause() {
		if (!this.audioPlayer) return "Nothing to pause."
		else {
			this.audioPlayer.pause();
			return "Paused.";
		}
	}
	resume() {
		if (!this.audioPlayer) return "Nothing to resume."
		else {
			this.audioPlayer.unpause();
			return "Resumed.";
		}
	}
	setShuffle(interaction) {
		let bool = interaction.options.get("set").value;
		this.shuffle = bool;
		config.shuffle[this.guildId] = bool;
		fs.writeFileSync(filename, JSON.stringify(config, null, 2));
		if (bool) { 
			this.shuffleArray(this.queue); 
			return "Queue has been shuffled, and auto-shuffle has been toggled on.";
		}
		else return "auto-shuffle has been toggled off.";
		
	}
	shuffleArray(arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
	}
	clear() { 
		this.queue = []; 
		return "Queue Cleared."
	}
	skip(interaction) {
		if (interaction.options.get("number")) {
			this.playlistIndex += interaction.options.get("number").value-1;
			if (this.playlistIndex >= this.queue.length) this.playlistIndex = 0;
		}
		return this.playNextSong();
	}
	async listQueue() {
		let result = "The next 5 songs in the queue are: \n";
		for (let i = this.playlistIndex; i<this.queue.length && i<this.playlistIndex+5; i++) {
			let track = await this.getTrackName(this.queue[i]);
			if (track[1]) result = result +(i+1)+": ["+track[0]+"](<"+track[1]+">)\n";
			else result = result +(i+1)+": "+track[0]+"\n"; 
		}
		result = result+"("+this.queue.length+" songs total.)\n";
		return result;
	}
	async getCurrent() {
		let result;
		let track = await this.getTrackName(this.queue[(this.playlistIndex == 0) ? this.playlistIndex : this.playlistIndex-1]);
		if (track[1]) result = "["+track[0]+"](<"+track[1]+">)\n";
		else result = track[0];
		
		return result;
	}
	async queueSongs(input) {
		let numQueued = 1;
		if (await this.checkYoutubeVideoLink(input)) {
			this.queue.push(input);
			let temp = await youtube.video_info(input);
			input = temp.video_details.title;
		}
		//else if (/*check for spotify playlist*/false) {} 
		//else if (/*check for spotify link*/false) {}
		else if (localPlaylists.includes(input)) {
			let result = this.queueLocalFolder(input);
			input = result[0]; numQueued = result[1];
		} //get full file addr(s)
		else if (await this.checkYoutubePlaylistLink(input)) { 

		//REMINDER TO PUT IN A GITHUB ISSUE FOR THE PL VALIDATION (not all playlist IDs are 34 characters, older ones can be less) if it doesn't get fixed. Example: https://www.youtube.com/playlist?list=PLC5AE6E1EEA630D30
			let result = await this.queueYoutubePlaylist(input);
			input = result[0]; numQueued = result[1];
		}
		else {
			input = await this.queueYoutubeSearch(input);
		}
		return input+" has been queued. ("+numQueued+" song(s))";
	}
	getGuildId() {
		return this.guildId;
	}
	async action(act, interaction) {
		if (act == 'join') return this.joinChannel(this.client, interaction);
		if (act == 'playing') return (this.audio) ? "Now playing "+await this.getCurrent() : "Not currently playing anything!";
		if (act == 'play') return await this.playAudio(this.client, interaction);
		if (act == 'resume') return this.resume();
		if (act == 'pause') return this.pause();
		if (act == 'skip') { return this.skip(interaction); }
		if (act == 'leave') return this.leaveChannel(); 
		if (act == 'shuffle') return this.setShuffle(interaction);
		if (act == 'clear') return this.clear();
		if (act == 'playlists') return this.localPlaylists.toString();
		if (act == 'queue') return await this.listQueue();
		return "Invalid command. This should never appear, and is a bug with Andkion. Tell atkion what you did to get this message.";
	}
}