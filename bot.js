var config = require('./config');
var token = config.telegramToken;

var PluginManager = require('./plugins');
var plugins = new PluginManager();

var _ = require('underscore');

var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(token, {
    polling: true
});

var
  util = require('util'),
  couchdb = require('felix-couchdb'),
  client = couchdb.createClient(5984, 'localhost'),
  db = client.db('bot-logging');

console.log("The bot is starting...");
plugins.runPlugins(config.activePlugins);

bot.on('message', function(msg) {
    if (msg.text) {
        // MVP for logging
        // TODO replace with Winston, https://github.com/winstonjs/winston
        var chatId = msg.chat.id;
        var messageId = msg.message_id;
        db
          .saveDoc(messageId, msg, function(er, ok) {
            if (er) throw new Error(JSON.stringify(er));
            console.log('Saved doc to couch:');
            console.log(msg);
          });
        plugins.doMessage(msg, function(reply) {
            switch (reply.type) {
                case "text":
                    bot.sendMessage(chatId, reply.text, reply.opts);
                    break;
                case "audio":
                    bot.sendAudio(chatId, reply.audio);
                    break;
                case "photo":
                    bot.sendPhoto(chatId, reply.photo);
                    break;
                case "status":
                    bot.sendChatAction(chatId, reply.status);
                    break;
                default:
                    console.log("Error: Unrecognized response");
            }
        });
    }
});

// If `CTRL+C` is pressed we stop the bot safely.
process.on('SIGINT', shutDown);

// Stop safely in case of `uncaughtException`.
process.on('uncaughtException', function(error) { 
    console.log(error);
    shutDown();
});

function shutDown() {
    console.log("The bot is shutting down...");
    plugins.shutDown(function() {
        process.exit();
    });
}
