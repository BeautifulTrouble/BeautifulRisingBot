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
    db = client.db('bot-logging'),
    user = client.db('_users');

console.log("The bot is starting...");
plugins.runPlugins(config.activePlugins);

bot.on('message', function(msg) {
    if (msg.text) {
        // TODO replace with Winston, https://github.com/winstonjs/winston
        var chatId = msg.chat.id;
        logMsg(msg);
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
            logReply(msg, reply);
        });
    }
});

function handleMessage(msg) {

}

function logMsg(msg) {
    db
    .saveDoc(msg.message_id, msg, function(er, ok) {
        if (er) throw new Error(JSON.stringify(er));
    });
}

function logReply(msg, reply) {
    db
    .getDoc(msg.message_id, function(er, doc) {
        if (er) throw new Error(JSON.stringify(er));
        var newDoc = doc;
        newDoc.reply  = reply.opts;
        newDoc._rev = doc._rev;
        updateDoc(newDoc);
    });
}

function updateDoc(doc) {
    db.saveDoc(doc.message_id, doc, function(er, ok) {
        if (er) throw new Error(JSON.stringify(er));
    });
}

// If `CTRL+C` is pressed we stop the bot safely.
process.on('SIGINT', shutDown);

// Stop safely in case of `uncaughtException`.
process.on('uncaughtException', function(error) {
    console.trace(error);
    shutDown();
});

function shutDown() {
    console.log("The bot is shutting down...");
    plugins.shutDown(function() {
        process.exit();
    });
}
