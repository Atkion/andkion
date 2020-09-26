const fs = require('fs');
const path = require('path');
let win = false;
let remainingGuesses = 12;
let guessedLetters = [];
let wordLength = 0;
let globalPattern = '';
let globalWords = [];
const letters = {
	'🇦': 'a', '🇧': 'b', '🇨': 'c', '🇩': 'd', '🇪': 'e', '🇫': 'f', '🇬': 'g', '🇭': 'h', '🇮': 'i', 
	'🇯': 'j', '🇰': 'k', '🇱': 'l', '🇲': 'm', '🇳': 'n', '🇴': 'o', '🇵': 'p', '🇶': 'q', '🇷': 'r', 
	'🇸': 's', '🇹': 't', '🇺': 'u', '🇻': 'v', '🇼': 'w', '🇽': 'x', '🇾': 'y', '🇿': 'z'
}
const filter = (reaction, user) => {
	return Object.keys(letters).includes(reaction.emoji.name);
}

function getDictionary(filename) {//Returns the entire dictionary.
	return fs.readFileSync(filename).toString().split('\n');
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
	let wordLists = [];
	patterns.forEach(pattern => {
		let matching = [];
		words.forEach(word => {
			if (getPattern(word, letter) == pattern) matching.push(word);
		});
		wordLists.push(matching);
	});
	return wordLists;
}

function getLargestRemaining(wordLists) {//Returns the largest of a list of stringlists.
	let largest = [];
	wordLists.forEach(list => {
		if (list.length > largest.length) largest = list;
	});
	return largest;
}

function getWordList(filename, size, letter) {//Simplifies the calls to all the other functions. Returns the largest list of words of length size with a common pattern.
	return getLargestRemaining(getPartitions(getDictionaryByNum(filename, size), getPatterns(getDictionaryByNum(filename, size), letter), letter));
}

function updatePattern(pattern, word, letter) {//Takes the old pattern and updates it with a new word and letter.
	let result = '';
	if (word != "" && word != null) {
		word.split('').forEach((ch, i) => {
			if (ch == letter) result += ch;
			else if (pattern[i] == '-') result += '-';
			else result += ch;
			i++;
		});
	}
	return result;
}

function updatePatterns(pattern, words, letter) {//Makes a new list of patterns based on a new letter and the old pattern.
	let patterns = [];
	words.forEach(word => {
		let newPattern = updatePattern(pattern, word, letter);
		if (!patterns.includes(newPattern)) patterns.push(newPattern);
	});
	return patterns;
}

function updatePartitions(words, patterns, letter, pattern) {//Composes a list of words based on each pattern.
	let wordLists = [];
	patterns.forEach(pattern => {
		let matching = [];
		words.forEach(word => {
			if (updatePattern(pattern, word, letter) == pattern) matching.push(word);
		});
		wordLists.push(matching);
	});
	return wordLists;
}

function updateWordList(words, letter, pattern) {//Same as getWordList, but updates it this time.
	return getLargestRemaining(updatePartitions(words, updatePatterns(pattern, words, letter), letter, pattern));
}

function progressGame(msg, letter) {
	if (!guessedLetters.includes(letter)) {
		remainingGuesses--;
		guessedLetters.push(letter);
		if (guessedLetters.length == 1) {
			let wordList = getWordList(path.resolve('/modules/dictionary.txt'), wordLength, letter);
			msg.edit("Status: "+getPattern(wordList[0], letter)+". Guesses Remaining: "+remainingGuesses);
			globalPattern = getPattern(wordList[0], letter);
			globalWords = wordList;
		}
		else {
			let wordList = updateWordList(globalWords, letter, globalPattern);
			msg.edit("Status: "+updatePattern(globalPattern, wordList[0], letter)+". Guesses Remaining: "+remainingGuesses);
			globalPattern = updatePattern(globalPattern, wordList[0], letter);
			globalWords = wordList;
			if (!globalPattern.includes('-')) {
				win = true;
				return true;
			}
		}
		if (remainingGuesses <= 0) {
			msg.edit("You lose! The word was "+globalWords[0]);
			return false;
		}
	}
}

exports.hangman = class {
	constructor(client) {
		this.client = client;
	}
	
	startGame(msg, wlength) {
		win = false;
		remainingGuesses = 12;
		guessedLetters = [];
		wordLength = wlength;
		if (wordLength < 5 || wordLength > 12 || !wlength) {
			msg.edit("Invalid length. Must be between 4 and 13. Ex: 'hang me a man 8'"); 
			return false;
		}
		msg.edit("Welcome! Please react with your first guess to begin.");
		let collector = msg.createReactionCollector(filter);
		collector.on('collect', (reaction) => {
			if (win == true) {
				msg.edit("You win! Congratulations!");
				return true;
			}
			else return (progressGame(msg, letters[reaction.emoji.name])) ? true : false;
		});
	}
};
