var winston = require('winston');
var winstonCouch = require('winston-couchdb').Couchdb;
// Configure the basic file logger
winston.loggers.add('filelog', {
    console: {
        colorize: true,
        label: 'log-file'
    },
    file: {
        filename: './winston.log'
    }
});
// Configure the couchdb logger
winston.loggers.add('couchlog', {
    console: {
        colorize: true,
        label: 'log-couch'
    },
    couchdb: {
      host: 'localhost',
      port: 5984
    }
});
var couchlog = winston.loggers.get('couchlog');
var filelog = winston.loggers.get('filelog');

exports.match = function() {
    return true;
};

// I intend to make this optional in future in case it doesn't actually respond to commands
exports.help = function() {
    return [];
};

exports.run = function(api, event) {
        var command = api.commandPrefix;
        var userFullName = event.sender_name + '-' + event.sender_id;
        couchlog.info('Received %s from %s', event.arguments[0], userFullName, { "message_id": event.thread_id, "command":  event.arguments[0], "user": userFullName, "response": "No command matched" }); 
    // This needs to pull from botflow and provide translations
        api.sendMessage('Ooops, I’m not sure what module you’re talking about. Try finding a module first using the ' + command + 'menu or ' + command + 'search command.' , event.thread_id);
};
