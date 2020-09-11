const fs = require('fs');

function getDictionary(filename) {//Returns the entire dictionary.
	return fs.readFileSync(filename, 'utf8').split('\r\n');
}

function getDictionaryByNum(filename, size) {//Returns all words in the dictionary of length size.
	words = getDictionary(filename);
	let wordsOfSize = [];
	words.forEach((word) => {
		if (word.length == size) wordsOfSize.push(word);
	});
	return wordsOfSize;
}

function getPattern(word, letter) {//Takes a word and a letter, and returns the resulting pattern.
	let pattern = '';
	word.split('').forEach( corr => {
		pattern += (corr == letter) ? corr : '-';
	});
	return pattern;
}

function getPatterns(words, letter) {//Loops through a list of words and makes a list of all unique patterns.
	let patterns = [];
	words.forEach(word => {
		let pattern = getPattern(word, letter);
		if (!patterns.includes(pattern)) patterns.push(pattern);
	});
	return patterns;
}

function getPartitions(words, patterns, letter) {//Composes a list of words based on each pattern.

}

function getLargestRemaining(wordLists) {//Returns the largest of a list of stringlists.
	
}

function getWordList(filename, size, letter) {//Simplifies the calls to all the other functions. Returns the largest list of words of length size with a common pattern.
	
}

function updatePattern(pattern, word, letter) {//Takes the old pattern and updates it with a new word and letter.
	
}

function updatePatterns(pattern, words, letter) {//Makes a new list of patterns based on a new letter and the old pattern.
	
}

function updatePartitions(words, patterns, letter, pattern) {//Composes a list of words based on each pattern.
	
}

function updateWordList(words, letter, pattern) {//Same as getWordList, but updates it this time.
	
}

exports.hangman = class {
	constructor(client) {
		this.client = client;
	}
	
	startGame(msg) {
		//console.log(getDictionaryByNum('./dictionary.txt', 6));
		//console.log(getPattern('abates', 'a'));
	}
};