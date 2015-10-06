var TelegramBot = require('node-telegram-bot-api');
var Handlebars = require('handlebars');
var request = require('request');
var Trello = require('node-trello');
var _ = require('underscore');
var slugify = require("underscore.string/slugify");
var capitalize = require("underscore.string/capitalize");
var archieml = require('archieml');
var
  util = require('util'),
  couchdb = require('felix-couchdb'),
  client = couchdb.createClient(5984, 'localhost'),
  db = client.db('bot-logging');

// Read the configuration
var conf = require('./package.json');
var version = conf.version;

var trello_key = process.env.TRELLO_KEY || '';
var trello_token = process.env.TRELLO_TOKEN || '';
var t = new Trello(trello_key, trello_token);

// Use Trello as the API for now, modules are cards
// Lets just story the cards for now, as they don't change often
var board = {}; // An object to hold the board's cards
board.cards = []; // An array for the cards

// Telegram bot
var options = {
    polling: true
};

var token = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';

var bot = new TelegramBot(token, options);
bot.getMe().then(function (me) {
    console.log('Hi my name is %s!', me.username);
});

// Poll for messages from Telegram
bot.on('text', function (msg) {
    var chatId = msg.chat.id;
    var messageId = msg.message_id;
    // MVP for logging
    // TODO replace with Winston, https://github.com/winstonjs/winston
    db
      .saveDoc(messageId, msg, function(er, ok) {
        if (er) throw new Error(JSON.stringify(er));
        console.log('Saved doc to couch:');
        console.log(msg);
      });

    // Start
    if (msg.text == '/start') {
        // Load or re-load the Trello cards
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
        var opts = {
            reply_markup: JSON.stringify({
                one_time_keyboard: true,
                resize_keyboard: true,
                keyboard: [
                    ['/tactics', '/principles'],
                    ['/big_ideas', '/stories'],
                    ['/tools', '/define'],
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
        var reply_text = HelpTemplate(msg.chat);
        bot.sendMessage(chatId, reply_text, opts);
    }

    // Settings
    if (msg.text == '/settings') {
        // User-specific settings
        bot.sendMessage(chatId, 'Settings stub');
    }

    // Define
    if (msg.text == '/define') {
        // Define the terms
        var reply_text = DefineTemplate(msg.chat);
        bot.sendMessage(chatId, reply_text, opts);
    }

    // Menu
    if (msg.text == '/menu') {
        // Show the menu
        var reply_text = MenuTemplate(msg.chat);
        bot.sendMessage(chatId, reply_text, opts);
    }

    // Search without a term
    // TODO 
    if (msg.text == '/search') {
        // Ask for a search term
        var reply_text = SearchEmptyTemplate(msg.chat);
        bot.sendMessage(chatId, reply_text, opts);
    }

    // Search with a term
    var searchTerm = msg.text.match(/^\/search\s(.*)$/);
    if (searchTerm) {
        searchRegExp = new RegExp(searchTerm[1] , 'i');
         // Create a filtered collection of cards
        var filteredList = {};
        filteredList.searchTerm = searchTerm[1];
        filteredList.cards = [];
        filteredList.cards = board.cards.filter(function(card){
            return searchRegExp.test(card.name);
        });
        //console.log(results);
        var reply_text = SearchResultsTemplate(filteredList);
        bot.sendMessage(chatId, reply_text, opts);
    }

    if (msg.text == '/stories' || msg.text == '/big_ideas' || msg.text == '/tactics' || msg.text == '/principles' || msg.text == '/tools' ) {
        var type = msg.text;
        // Remove leading slash
        type = type.replace(/\//, '');
        // Capitlize
        var typeName = capitalize(type);
        // Create a filtered collection of cards
        var filteredList = {};
        filteredList.moduleType = type;
        filteredList.moduleTypeName = typeName;
        filteredList.cards = [];
        filteredList.cards = board.cards.filter(function(el) {
            return el["label_" + type] == true &&
                // Only if it's not in list 552fe48327ca601d7b2d2453
                // Or in list  55a82fb3bdf8ada2fa42dd88
                el["idList"] != '552fe48327ca601d7b2d2453' &&
                el["idList"] != '55a82fb3bdf8ada2fa42dd88';
                // Only "Game card" labelled cards for now
                //el.label_game_card == true;
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
            // TODO implement these accessors
            // Return a menu
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
            console.log(found.desc);
            var cardData = archieml.load(found.desc);
            found.cardData = cardData;
            var reply_text = ModuleDetailTemplate(found);
            // Send the menu
            //bot.sendMessage(chatId, reply_text, opts );
            bot.sendMessage(chatId, reply_text, opts);
        } else { 
            bot.sendMessage(chatId, "Did not find a module or card matching that ID" );
        }
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
    
    //var commands = msg.text.match(/start|help|menu|settings|tactics|principles/);
    //console.log(commands);
    var commands = new RegExp('start|help|menu|define|search|settings|tactics|principles|stories|big_ideas|tools|more|save|share', 'i');
    var module_ids  = /^\/\d+$/;
    if ( commands.test( msg.text ) === false ) {
        if ( module_ids.test ( msg.text ) === false ) {
            // Didn't understand the command
            var reply_text = CommandNotFoundTemplate(msg.chat);
            bot.sendMessage(chatId, reply_text, opts);
        }
    }
});


/////////////////////////////////
//  HANDLEBARS TEMPLATES 
/////////////////////////////////

// Start
var StartSource = "Hello {{first_name}} {{last_name}},\n" +
    "You've reached the Beautiful Rising Bot!\n" +
    "\n" +
    "This bot can speak English, Arabic, and Esperanto.\n" +
    "You can change this with /settings (not actually implemented yet)\n" +
    "\n" +
    "You can use /help to get a list of all commands.\n" +
    "\n" +
    "You can start by choosing one of the available types of resources on the keyboard below, " +
    "or type /define to get a definition of what's available. 😊";
var StartTemplate = Handlebars.compile(StartSource);

// Module (card) list
var ModuleListSource = "{{#if cards.length}}{{moduleTypeName}} available:\n" + 
    "{{#cards}}➡️ {{{name}}}: Type /{{idShort}} for more. \n{{/cards}}" + 
    "{{else}}No {{moduleTypeName}} cards avaialble{{/if}}";
var ModuleListTemplate = Handlebars.compile(ModuleListSource);

// Module (card) detail
var ModuleDetailSource = "{{{name}}}\n" + 
    "{{#if cardData.in_sum}}{{{cardData.in_sum}}}\n" +
    "By {{{cardData.author}}}\n" +
    "Google Doc: {{cardData.g_doc}}\n" +
    "{{else}}No card data available{{/if}}";
var ModuleDetailTemplate = Handlebars.compile(ModuleDetailSource);

var DefineSource = "Okay, {{first_name}}, let me help 👍: A tactic is a specific form of creative action, such as a flash mob or an occupation | A Principle is a design guideline for movement building and action planning | Big Ideas are big-picture concept and ideas that help us understand how the world works and how we might go about changing it. | Finally stories of resistance & change are capsules of successful and instructive creative actions, useful for illustrating how principles, tactics and big ideas can be successfully applied in practice. \n\n Would you like to access /tactics /principles /big_ideas /tools or /stories ?"
var DefineTemplate = Handlebars.compile(DefineSource);

var HelpSource = "Okay, {{first_name}}, I can help.\n" + 
    "The available commands are:\n" +
    "/define - Definitions for the types of the content\n" +
    "/search - Search for content by name\n" +
    "/big_ideas - List all Big ideas\n" +
    "/principles - List all Principles\n" +
    "/stories - List all Stories\n" +
    "/tactics - List all Tactics\n" +
    "/tools - List all Tools\n" +
    "";
var HelpTemplate = Handlebars.compile(HelpSource);

//var MenuSource = "Here are all of the commands available: \n * To come\n";
var MenuTemplate = Handlebars.compile(HelpSource);


// Module (card) search results
var SearchResultsSource = "{{#if cards.length}}Matching cards for '{{searchTerm}}:\n" + 
    "{{#cards}}➡️ {{{name}}}: Type /{{idShort}} for more. \n{{/cards}}" + 
    "{{else}}No matching cards found for {{searchTerm}}. 😪{{/if}}";
var SearchResultsTemplate = Handlebars.compile(SearchResultsSource);

// Search is empty
var SearchEmptySource   = "It doesn't look like you entered a search term. Try, for example, '/search topic'";
var SearchEmptyTemplate = Handlebars.compile(SearchEmptySource);

// Command not found 
var CommandNotFoundSource   = "I don't know how to respond to that command. Type /help for assistance with the commands";
var CommandNotFoundTemplate = Handlebars.compile(CommandNotFoundSource);
