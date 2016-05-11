/**
 * Credit to notawoldorf, https://github.com/notwaldorf/emoji-translate from which some of this code is derived.
 */
'use strict';
const SYMBOLS = '!"#$%&\'()*+,-./:;<=>?@[]^_`{|}~';

function *entries(obj) {
    for (let key of Object.keys(obj)) {
        yield [key, obj[key]];
    }
};

let emojilib = require('emojilib');

    /**
     * Returns a possibly translated english word to emoji.
     * @param {String} word The word to be translated
     * @returns {String} translated word
     * @author notawoldorf
     */
    translateWord = (word) => {
        let emoji,
            translation = word,

        // Punctuation blows. Get all the punctuation at the start and end of the word.
            firstSymbol = '',
            lastSymbol = '';

        while (SYMBOLS.indexOf(word[0]) !== -1) {
            firstSymbol += word[0];
            word = word.slice(1, word.length);
        }

        while (SYMBOLS.indexOf(word[word.length - 1]) !== -1) {
            lastSymbol += word[word.length - 1];
            word = word.slice(0, word.length - 1);
        }

        emoji = getMeAnEmoji(word);
        if (emoji && emoji !== '') {
            translation = firstSymbol + emoji + lastSymbol;
        }

        return translation;
    },

    /**
     * Returns the emoji equivalent of an english word.
     * @param {String} word The word to be translated
     * @returns {String} The emoji character representing this word, or '' if one doesn't exist.
     * @author notawoldorf
     */
    getMeAnEmoji = (word) => {
        word = word.trim().toLowerCase();

        if (!word || word === '' || word === 'it')
            return '';

        // Maybe this is a plural word but the word is the singular?
        // Don't do it for two letter words since "as" would become "a" etc.
        let maybeSingular = '';
        if (word.length > 2 && word[word.length - 1] === 's')
            maybeSingular = word.slice(0, word.length - 1);

        // Maybe this is a singular word but the word is the plural?
        // Don't do this for single letter since that will pluralize crazy things.
        let maybePlural = (word.length === 1) ? '' : word + 's';


        let emoji = exports.config.translations[word];
        if (emoji) {
            return emoji[random(emoji)];
        }
        emoji = exports.config.translations[maybeSingular];
        if (emoji) {
            return emoji[random(emoji)];
        }
        emoji = exports.config.translations[maybePlural];
        if (emoji) {
            return emoji[random(emoji)];
        }
        return '';
    },

    updateEmojiList = () => {
        if (!exports.config.translations) {
            exports.config.translations = {};
        }
        for (let [emojiWord, properties] of entries(emojilib.lib)) {
            for (let keyword of properties.keywords) {
                checkForCustomEmoji(keyword, properties.char);
            }
            if (emojiWord.length > 2 && !emojiWord.includes('_')) {
                checkForCustomEmoji(emojiWord, properties.char);
            }
        }
    },

    checkForCustomEmoji = (keyword, emoji) => {
        if (!exports.config.translations[keyword]) {
            if (emoji && emoji !== null) {
                exports.config.translations[keyword] = [emoji];
            }
        }
        else {
            if (!exports.config.translations[keyword].custom) {
                if (emoji && emoji !== null) {
                    exports.config.translations[keyword].push(emoji);
                }
            }
        }
    },

    addEmoji = (emoji, keywords) => {
        emoji.custom = true;
        for (let word of keywords) {
            exports.config.translations[word] = [emoji];
        }
    },

    removeKeywords = (keywords) => {
        for (let word of keywords) {
            delete exports.config.translations[word];
        }
    },

    random = (list) => {
        return Math.floor(Math.random() * list.length)
    };

exports.run = (api, event) => {
    let message = '',
		emoji = [];

    if (event.arguments[1] === 'update') {
        updateEmojiList();
    }
    else if (event.arguments[1] === 'add' && event.arguments.length >= 4) {
        addEmoji(event.arguments[2], event.arguments.slice(3));
    }
    else if (event.arguments[1] === 'remove' && event.arguments.length >= 3) {
        removeKeywords(event.arguments.slice(2));
    }
    else {
        for (let word of event.arguments.slice(1)) {
            emoji.push(translateWord(word));
        }
        message = emoji.join(' ');

        if (message === '') {
            let emojis = Object.keys(exports.config.translations),
                emojiWord = emojis[random(emojis)],
                emoji = exports.config.translations[emojiWord][random(exports.config.translations[emojiWord])];
            message = `Nothing to translate, so here is a ${emojiWord} ${emoji}`;
        }

        api.sendMessage(message, event.thread_id);
    }
};

exports.load = () => {
    if (!exports.config.translations) {
        updateEmojiList();
    }
} ;
