var TelegramBot = require('node-telegram-bot-api');
var Handlebars = require('handlebars');
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
        // Reset any custom menus
        var opts = {
            reply_markup: JSON.stringify({
                hide_keyboard: true
            })
        };
        // Send introduction and menu options
        bot.sendMessage(chatId, 'Introductory text', opts);
    }

    // Help
    if (msg.text == '/help') {
        bot.sendMessage(chatId, 'Help text');
    }

    // Settings
    if (msg.text == '/settings') {
        // User-specific settings
        bot.sendMessage(chatId, 'Settings stub');
    }

    // Menu
    if (msg.text == '/menu') {
        // Show the menu
        bot.sendMessage(chatId, 'Menu stub');
    }

    // Search
    if (msg.text == '/search') {
        // Not implemented
        bot.sendMessage(chatId, 'Search stub');
    }

    // Tactics
    if (msg.text == '/tactics') {
        // Get and list Tactics
        // http://beautifultrouble.github.io/BeautifulRisingBot/tactics.json
        var url = 'http://beautifultrouble.github.io/BeautifulRisingBot/tactics.json';
        // From HTTP request!
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body) // Show the HTML for the Google homepage.
                var tactics = JSON.parse(body);
                var reply_text = TacticsTemplate(tactics);
                bot.sendMessage(chatId, reply_text);
            }
        });
        bot.sendMessage(chatId, 'Looking up Tactics...');
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

    // TODO Generalize this
    var getTactic = msg.text.match(/^\/tactic(\d+)$/);
    var getPrinciple = msg.text.match(/^\/principle(\d+)$/);
    var getBigidea = msg.text.match(/^\/bigidea(\d+)$/);
    var getStory = msg.text.match(/^\/story(\d+)$/);
    
    if ( getTactic )  {
        bot.sendMessage(chatId, "Looks like you're searching for " + getTactic[1] );
        // http://beautifultrouble.github.io/BeautifulRisingBot/tactics.json
        var url = 'http://beautifultrouble.github.io/BeautifulRisingBot/tactics.json';
        // From HTTP request!
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var tactics = JSON.parse(body);
                // Search for the tactic ID in the array of tactics
                var id = getTactic[1];
                var found = tactics.tactics.reduce(function(found, el){
                    return found || (el.id == id && el);
                },null);
                if ( found ) { 
                    bot.sendMessage(chatId, found.title );
                } else { 
                    bot.sendMessage(chatId, "Did not find a Tactic matching that ID" );
                }
            }
        });
    }

});

var TacticsSource = "Tactics are fascinating\n" + 
    "They span many lines\n" + 
    "{{#tactics}}* {{title}}\n{{/tactics}}";
var TacticsTemplate = Handlebars.compile(TacticsSource);
