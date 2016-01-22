/**
 * Credit to notawoldorf, https://github.com/notwaldorf/emoji-translate from which some of this code is derived.
 */

const SYMBOLS = '!"#$%&\'()*+,-./:;<=>?@[]^_`{|}~';

let request = require.safe('request'),

/**
 * Returns a possibly translated english word to emoji.
 * @param {String} word The word to be translated
 * @returns {String} translated word
 */
translateWord = (word) => {
    let emoji,
        translation = word,

        // Punctuation blows. Get all the punctuation at the start and end of the word.
        firstSymbol = '',
        lastSymbol = '';

    while (SYMBOLS.indexOf(word[0]) != -1) {
        firstSymbol += word[0];
        word = word.slice(1, word.length);
    }

    while (SYMBOLS.indexOf(word[word.length - 1]) != -1) {
        lastSymbol += word[word.length - 1];
        word = word.slice(0, word.length - 1);
    }

    emoji = getMeAnEmoji(word);
    if (emoji && emoji != '') {
        translation = emoji;
    }

    return translation;
},

/**
 * Returns the emoji equivalent of an english word.
 * @param {String} word The word to be translated
 * @returns {String} The emoji character representing this word, or '' if one doesn't exist.
 */
getMeAnEmoji = (word) => {
    word = word.trim().toLowerCase();

    if (!word || word === '' || word === 'it')
        return '';

    // Maybe this is a plural word but the word is the singular?
    // Don't do it for two letter words since "as" would become "a" etc.
    let maybeSingular = '';
    if (word.length > 2 && word[word.length - 1] == 's')
        maybeSingular = word.slice(0, word.length - 1);

    // Maybe this is a singular word but the word is the plural?
    // Don't do this for single letter since that will pluralize crazy things.
    let maybePlural = (word.length == 1) ? '' : word + 's';

    // Go through all the things and find the first one that matches.
    for (let emoji in this.config.translations) {
        let words = this.config.translations[emoji].keywords;
        if (emoji == word || emoji == maybeSingular || emoji == maybePlural ||
            (words && words.indexOf(word) >= 0) ||
            (words && words.indexOf(maybeSingular) >= 0) ||
            (words && words.indexOf(maybePlural) >= 0))
            return this.config.translations[emoji].char;
    }
    return '';
};


if (!this.config.translations) {
    request.get('https://raw.githubusercontent.com/notwaldorf/emoji-translate/master/bower_components/emojilib/emojis.json', (err, response, body) => {
        body = JSON.parse(body);
        if (response.statusCode === 200 && body) {
            this.config.translations = body;
        }
    });
}

exports.match = (text, commandPrefix) => {
    return text.startsWith(commandPrefix + 'emoji');
};

exports.help = () => {
    return [[this.commandPrefix + 'emoji "<text>"','translates text into emoji.', 'inspiration and translations taken from https://github.com/notwaldorf/emoji-translate'] ];
};

exports.run = (api, event) => {
    let text= event.body.substring(api.commandPrefix.length + 6),
        message = '';

    text = text.split(/\s*;\s*/);

    for (let i = 0; i < text.length; i++) {
        message += translateWord(text[i]) + " ";
    }

    message = message.substring(0, message.length - 1);

    if (message == '') {
        let emojis = Objects.keys(this.config.translations),
            index = Math.floor(Math.random() * emojis.length),
            emoji = emojis[index];
        message = "Nothing to translate, so here is a " + index + " " + emoji.char;
    }

    api.sendMessage(message, event.thread_id);
};


