var TelegramBot = require('node-telegram-bot-api');
var Handlebars = require('handlebars');
var request = require('request');
var Trello = require('node-trello');
var _ = require('underscore');
var slugify = require("underscore.string/slugify");
var capitalize = require("underscore.string/capitalize");
var conf = require('./package.json');

var trello_key = process.env.TRELLO_KEY || '';
var trello_token = process.env.TRELLO_TOKEN || '';
var version = conf.version;

var t = new Trello(trello_key, trello_token);

// Lets just story the cards for now, as they don't change often

var board = {}; // An object to hold the board's cards
board.cards = []; // An array for the cards
t.get("/1/boards/awhXkqQu/cards", { cards: "open" }, function(err, data) {
    if (err) throw err;
    data.forEach(function(el) {
        // Add the labels as a property of the card object
        el.labels.forEach(function(l) {
            var label = l.name.toLowerCase();
            label = label.replace(/\W/, '_');
            el["label_" + label] = true;
        });
        board.cards.push(el);
    });
});

var options = {
    polling: true
};

var token = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';

var bot = new TelegramBot(token, options);
bot.getMe().then(function (me) {
    console.log('Hi my name is %s!', me.username);
});

var tactics;

bot.on('text', function (msg) {
    console.log(msg);
    var chatId = msg.chat.id;

    // Start
    if (msg.text == '/start') {
        // Reset any custom menus
        //var opts = {
        //reply_markup: JSON.stringify({
        //hide_keyboard: true
        //})
        //};
        var opts = {
            reply_markup: JSON.stringify({
                one_time_keyboard: true,
                resize_keyboard: true,
                keyboard: [
                    ['/tactics', '/principles'],
                    ['/big_ideas', '/stories'],
                ],
            })
        };
        var reply_text = StartTemplate(msg.chat);
        // Send introduction and menu options
        bot.sendMessage(chatId, 'Bot Version: ' + version );
        bot.sendMessage(chatId, reply_text, opts);
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

    // Define
    if (msg.text == '/define') {
        // Show the menu
        var reply_text = DefineTemplate(msg.chat);
        bot.sendMessage(chatId, reply_text);
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

    if (msg.text == '/stories' || msg.text == '/big_ideas' || msg.text == '/tactics' || msg.text == '/principles' ) {
        var type = msg.text;
        // Remove leading slash
        type = type.replace(/\//, '');
        // Un-slugify
        type = type.replace(/_/, ' ');
        // Capitlize
        var typeName = capitalize(type);
        // Create a filtered collection of cards
        var filteredList = {};
        filteredList.moduleType = type;
        filteredList.moduleTypeName = typeName;
        filteredList.cards = [];
        filteredList.cards = board.cards.filter(function(el) {
            return el["label_" + type] == true &&
                // Only "Game card" labelled cards for now
                el.label_game_card == true;
        });
        var reply_text = ModuleListTemplate(filteredList);
        bot.sendMessage(chatId, reply_text);
    }

    // TODO Generalize this
    var getModule = msg.text.match(/^\/(\d+)$/);
    //var getPrinciple = msg.text.match(/^\/principle(\d+)$/);
    //var getBigidea = msg.text.match(/^\/bigidea(\d+)$/);
    //var getStory = msg.text.match(/^\/story(\d+)$/);

    if ( getModule )  {
        var id = getModule[1];
        console.log(id);
        var found = board.cards.reduce(function(found, el){
            return found || (el.idShort == id && el);
        },null);
        if ( found ) { 
            //var opts = {
                //reply_markup: JSON.stringify({
                    //one_time_keyboard: true,
                    //resize_keyboard: true,
                    //keyboard: [
                        //['Full Read', 'Media'],
                        //['Challenges', 'Campaigns']
                    //],
                //})
            //};
            var reply_text = TacticDetailTemplate(found);
            //bot.sendMessage(chatId, reply_text, opts );
            bot.sendMessage(chatId, reply_text );
        } else { 
            bot.sendMessage(chatId, "Did not find a Tactic matching that ID" );
        }

        //// Get a photo
        //var photo_url = encodeURI(found.attachments[0].images.large.url);
        //var caption = found.attachments[0].caption;
        //request(photo_url, function (error, response, body) {
            //if (!error && response.statusCode == 200) {
                //// TODO actually upload, then send the photo
                ////bot.sendPhoto(chatId, body, {caption: caption});
                //bot.sendMessage(chatId, photo_url + "\n" + caption );
            //}
        //});
    }

    // More
    if (msg.text == '/more') {
        // Not implemented
        // text matching /more\d+
        // Returns more information (a list of what's avaialble)
        bot.sendMessage(chatId, 'More stub');
    }
    // Save
    // text matching /save\d+
    // Adds the module to a user-specific list of modules
    // Data will be persisted in CouchDB
    if (msg.text == '/save') {
        // Not implemented
        bot.sendMessage(chatId, 'Save stub');
    }
    // Share
    // text matching /share\d+
    // Provides options for sharing the module, e.g.:
    // E-mail, social media, other chat applications
    if (msg.text == '/share') {
        // Not implemented
        bot.sendMessage(chatId, 'Share stub');
    }

});



// Start template
var StartSource = "Hello {{first_name}} {{last_name}},\n" +
    "You've reached the Beautiful Rising Bot!\n" +
    "\n" +
    "This bot can speak English, Arabic, and Esperanto.\n" +
    "You can change this with /settings (not actually implemented yet)\n" +
    "\n" +
    "You can use /help to get a list of all commands.\n" +
    "\n" +
    "You can start by choosing one of the available types of resources on the keyboard below, " +
    "or type /define to get a definition of what's available";
var StartTemplate = Handlebars.compile(StartSource);

// Tactics list
var ModuleListSource = "{{#if cards.length}}{{moduleTypeName}} available:\n" + 
    "{{#cards}}* {{{name}}}: /{{idShort}}\n{{/cards}}" + 
    "{{else}}No {{moduleTypeName}} cards avaialble{{/if}}";
var ModuleListTemplate = Handlebars.compile(ModuleListSource);

// Tactic detail
var TacticDetailSource = "{{{name}}}\n" + 
    "{{{desc}}}\n";
var TacticDetailTemplate = Handlebars.compile(TacticDetailSource);

var DefineSource = "Okay, {{first_name}} {{last_name}}, let me help: A tactic is a specific form of creative action, such as a flash mob or an occupation | A Principle is a design guideline for movement building and action planning | Big Ideas are big-picture concept and ideas that help us understand how the world works and how we might go about changing it. | Finally stories of resistance & change are capsules of successful and instructive creative actions, useful for illustrating how principles, tactics and big ideas can be successfully applied in practice. \n\n Would you like to access /tactics /principles /big_ideas or /stories."
var DefineTemplate = Handlebars.compile(DefineSource);
