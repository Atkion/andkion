const Discord = require('discord.js');

const fs = require('fs');
const path = require('path');
let config = require('../config.json');
let filename = path.resolve('./config.json');


exports.AutoMod = class {
	constructor(client) {
		this.client = client;
	}
	parse(msg) {
		if (msg.author.id == '712635007981846601') msg.suppressEmbeds();
	}
}