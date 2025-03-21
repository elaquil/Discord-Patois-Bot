const { Client, GatewayIntentBits, Events } = require('discord.js');
const minimist = require('minimist');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const config = require('./config.json');

const argv = minimist(process.argv.slice(2));
const LOG = (argv['log'] || argv['l']) ? console.log.bind(console) : () => {};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

function randomBase64String(length = 16) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes)).slice(0, length);
}

const source_lang = 'auto';
const target_lang = 'jam';

client.on('ready', () => {
    console.log(`Bot is ready as: ${client.user.tag}`);
});

client.on(Events.MessageCreate, message => {
    LOG("Message Recieved from: " + message.author.username + "\nContents: " + message.content);

    if (message.author.tag == client.user.tag) {
        LOG("Message is from myself. Ignoring...");
        return;
    }

    if (!message.mentions.has(client.user)) {
        LOG("Bot is not mentioned in the message. Ignoring...");
        return;
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let cleanMessage = message.content.replace(urlRegex, '');
    const botTag = `<@${client.user.id}>`;
    cleanMessage = cleanMessage.replace(botTag, '').trim();

    if (cleanMessage === '') {
        LOG("Message is empty. Ignoring...");
        return;
    }
    if (message.embeds.length > 0) {
        LOG("Message contains an embed. Ignoring...");
        return;
    }

    const client_id = randomBase64String();
    const input_string = cleanMessage;
    
    const url = `https://translate.google.so/translate_a/t?client=${client_id}&sl=${source_lang}&tl=${target_lang}&q=${encodeURIComponent(input_string)}&tbb=1&ie=UTF-8&oe=UTF-8`;
    
    fetch(url)
    .then(response => response.json())
    .then(data => {
        let translatedText = data[0][0];
        if (translatedText.endsWith(" .")) {
            translatedText = translatedText.slice(0, -2);
        }
        LOG("Replied with:" + translatedText)
        message.reply(translatedText);
    })
    .catch(error => console.error('Error:', error));

});

LOG("Starting up bot with logging...");
client.login(config.token);