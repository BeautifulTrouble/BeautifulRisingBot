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
                    ['/bigideas', '/stories'],
                ],
            })
        };
        var reply_text = StartTemplate(msg.chat);
        // Send introduction and menu options
        
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

    // Let's save tactics once requested as the payload is large
    // Tactics
    if (msg.text == '/tactics') {
        // Get and list Tactics
        // http://beautifultrouble.github.io/BeautifulRisingBot/tactics.json
        //var url = 'http://beautifultrouble.github.io/BeautifulRisingBot/tactics.json';
        var url = 'http://beautifultrouble.org/api/get_recent_posts/?custom_fields=related_tactics,related_principles,related_theories,related_case_studies,related_practitioners&count=200&post_type=bt_tactic';
        // From HTTP request!
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Assign to global variable for now
                tactics = JSON.parse(body);
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
        var id = getTactic[1];
        var found = tactics.posts.reduce(function(found, el){
    return found || (el.id == id && el);
},null);
        if ( found ) { 
        var opts = {
            reply_markup: JSON.stringify({
                one_time_keyboard: true,
                resize_keyboard: true,
                keyboard: [
                    ['Full Read', 'Media'],
                    ['Challenges', 'Campaigns']
                ],
            })
        };
        var reply_text = TacticDetailTemplate(found);
        bot.sendMessage(chatId, reply_text, opts );
        } else { 
            bot.sendMessage(chatId, "Did not find a Tactic matching that ID" );
        }

        // Get a photo
        var photo_url = encodeURI(found.attachments[0].images.large.url);
        var caption = found.attachments[0].caption;
        request(photo_url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // TODO actually upload, then send the photo
                //bot.sendPhoto(chatId, body, {caption: caption});
                bot.sendMessage(chatId, photo_url + "\n" + caption );
            }
        });
    }
});

// Start template
var StartSource = "Hello {{first_name}} {{last_name}}\n" +
    "You've reached the Beatufiul Rising Bot!\n" +
    "\n" +
    "This bot can speak English, Arabic, and Esperanto.\n" +
    "You can change this with /settings\n" +
    "\n" +
    "You can use /help to get a list of all commands.\n" +
    "\n" +
    "You can start by choosing one of the avaialble types of resources on the keyboard below:";
var StartTemplate = Handlebars.compile(StartSource);

// Tactics list
var TacticsSource = "Tactics available:\n" + 
    "{{#posts}}* {{title}} (/tactic{{id}}) \n{{/posts}}";
var TacticsTemplate = Handlebars.compile(TacticsSource);

// Tactic detail
var TacticDetailSource = "{{title}}\n" + 
    "{{excerpt}}\n";
var TacticDetailTemplate = Handlebars.compile(TacticDetailSource);

