var TelegramBot = require('node-telegram-bot-api');
var request = require('request');

var options = {
    polling: true
};

var token = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';

var bot = new TelegramBot(token, options);
bot.getMe().then(function (me) {
    console.log('Hi my name is %s!', me.username);
});
bot.on('text', function (msg) {
    console.log(msg);
    var chatId = msg.chat.id;

    // Start
    if (msg.text == '/start') {
        bot.sendMessage(chatId, 'Introductory text');
    }

    // Help
    if (msg.text == '/help') {
        bot.sendMessage(chatId, 'Help text');
    }

    // Settings
    if (msg.text == '/settings') {
        bot.sendMessage(chatId, 'Settings stub');
    }

    // Menu
    if (msg.text == '/menu') {
        bot.sendMessage(chatId, 'Menu stub');
    }

    // Search
    if (msg.text == '/search') {
        bot.sendMessage(chatId, 'Search stub');
    }

    // Tactics
    if (msg.text == '/tactics') {
        bot.sendMessage(chatId, 'List Tactics stub');
    }


    // Principles
    if (msg.text == '/principles') {
        bot.sendMessage(chatId, 'List Principles stub');
    }

    // Big Ideas
    if (msg.text == '/bigideas') {
        bot.sendMessage(chatId, 'List Big Ideas stub');
    }

    // Big Ideas
    if (msg.text == '/stories') {
        bot.sendMessage(chatId, 'List Stories stub');
    }

});
