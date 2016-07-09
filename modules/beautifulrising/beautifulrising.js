var Handlebars = require.safe('handlebars');
var request = require.safe('request');
var _ = require.safe('underscore');
var s = require("underscore.string");
var removeMd = require.safe('remove-markdown');
var Fuse = require.safe('fuse.js');
var text;
var modules;
var config;
var users = [];
var commandPrefix;
var modulesRegex;
var utils = require('./utils.js');
// TODO move all of this to its own logging.js
// Set up logging
var winston = require.safe('winston');
var winstonCouch = require.safe('winston-couchdb').Couchdb;
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
filelog.info('The bot was started or restarted');

exports.match = function (event, commandPrefix) {
    command = commandPrefix;
    // All complex commands start with a regular expression
    modulesRegex = new RegExp("^" + commandPrefix + "tactics|stories|methodologies|principles|theories");
    readRegex    = new RegExp("^" + commandPrefix + "read(.*)$");
    var argument = event.arguments[0];
    // All basic commands get added here
    return event.arguments[0] === commandPrefix + 'start' 
        || event.arguments[0] === commandPrefix + 'menu' 
        || event.arguments[0] === commandPrefix + 'define'
        || event.arguments[0] === commandPrefix + 'menu'
        || event.arguments[0] === commandPrefix + 'search'
        || event.arguments[0] === commandPrefix + 'settings'
        || event.arguments[0] === commandPrefix + 'save'
        || event.arguments[0] === commandPrefix + 'saved'
        || event.arguments[0] === commandPrefix + 'more'
        || event.arguments[0] === commandPrefix + 'full'
        || event.arguments[0] === commandPrefix + 'images'
        || modulesRegex.test(argument)
        || readRegex.test(argument)
        || true; // Match everything for logging
};


exports.load = function() {
    // TODO 
    // If undefined, create this
    users = utils.loadUsers(exports.config);
    var API_URL = "https://api.beautifulrising.org/api/v1";
    var botflow = API_URL + "/text/botflow";
    var modulesEndpoint = API_URL + "/all";
    var configEndpoint = API_URL + "/config";
    // Get the bot-related objects from the API
    request.get(botflow, 
        function(error, response, body) {
            text = JSON.parse(body);
    });
    // Get the module objects from the API
    request.get(modulesEndpoint, 
        function(error, response, body) {
            console.debug('Got the modules');
            filelog.info('Modules loaded');
            var modulesNoId = JSON.parse(body);
            // Create a simpleId from the slug & add it to the objects
            modules = _.map(modulesNoId, function(module) {
                var slug = module.slug;
                var simpleId = slug.replace(/-/ig, '');
                module.simple_id = simpleId;
                return module;
        });
    });
    // Get the config object from the API
    request.get(configEndpoint, 
        function(error, response, body) {
            config = JSON.parse(body);
    });
};

exports.run = function(api, event) {
    var argument = event.arguments[0];
    var user = _.findWhere(users, { id: event.sender_id });
    if ( user === undefined ) {
        // If the user is not defined, then they're a first time user
        user = { id: event.sender_id, name: event.sender_name, first_seen: new Date(), saved_modules: [] };
        users.push(user);
    } else {
        // Otherwise, they're a returning user
        user.returning = 1;
    }
    var source = '';
    var template = '';
    var replyText = '';
    var currentModule = user.currentModule;
    if ( event.arguments[0] === command + 'start' ) {
        //=================================================================
        // User sent /start command (could send this always for new users)
        //=================================================================
        source = text['action-start'];
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command });
    } else if ( event.arguments[0] === command + 'define' ) {
        //=================================================================
        // User sent /define command
        //=================================================================
        source = text['action-define'];
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command });
    } else if ( event.arguments[0] === command + 'settings' ) {
        //=================================================================
        // User sent /setting command
        //=================================================================
        // TODO
        // Allow the user to set some basic flags, e.g.:
        // - Language preference
        // - E-mail address
        // - Twitter, etc.
    } else if ( event.arguments[0] === command + 'menu' ) {
        //=================================================================
        // User sent /menu command
        //=================================================================
        source = text['action-menu'];
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command });
        // TODO 
    } else if ( event.arguments[0] === command + 'search' ) {
        //=================================================================
        // User sent /search command
        //=================================================================
        // TODO explore if these should be pulled from CONFIG?
        var searchOptions = {
          caseSensitive: false,
          includeScore: false,
          shouldSort: true,
          tokenize: false,
          threshold: 0.3,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          keys: ["title"]
        };
        var fuse = new Fuse(modules, searchOptions);
        var results;
        var resultsCount;
        var query = event.arguments[1];
        console.debug("The query was: " + query);
        if ( query !== undefined ) {
            results = fuse.search(query);
            if ( results.length === 0 ) {
                resultsCount = undefined;
            } else {
                resultsCount = results.length;
            }
            source = text['iterator-module-search-results'];
        } else {
            source = text['error-no-search-query'] || 'No search query';
        }
        source = utils.ensureString(source);
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command, "count": resultsCount, "modules": results });
    } else if ( event.arguments[0] === command + 'settings' ) {
        //=================================================================
        // User sent /settings command
        //=================================================================
        // TODO 
    } else if ( event.arguments[0] === command + 'save' ) {
        //=================================================================
        // User sent /save command
        //=================================================================
        var savedModules  = user.saved_modules;
        savedModules.push(currentModule);
        uniqueModules = utils.saveUniqueObjects(savedModules);
        user.saved_modules = [];
        user.saved_modules = uniqueModules;
        source = text['action-save']; 
        source = utils.ensureString(source);
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command });
    } else if ( event.arguments[0] === command + 'saved' ) {
        //=================================================================
        // User sent /saved command
        //=================================================================
        source = text['action-show-saved']; 
        source = utils.ensureString(source);
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command });
    } else if ( event.arguments[0] === command + 'more' ) {
        //=================================================================
        // User sent /more command
        //=================================================================
        if ( utils.currentModule(user) === undefined ) {
            // No current module, return an error
            source = text['error-no-current-module'];
            module = {};
        } else {
            module = _.findWhere(modules, { "title": currentModule.name });
            source = text['action-module-read-more'];
            source = utils.ensureString(source);
        }
        var showFull = utils.checkForFull(module); 
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command, "module": module, "text": text, "full": showFull });
        replyText = removeMd(replyText);
    } else if ( event.arguments[0] === command + 'full' ) {
        //=================================================================
        // User sent /full command
        //=================================================================
        if ( utils.currentModule(user) === undefined ) {
            // No current module, return an error
            source = text['error-no-current-module'];
            module = {};
        } else {
            module = _.findWhere(modules, { "title": currentModule.name });
            source = text['action-module-read-full'];
            source = utils.ensureString(source);
        }
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command, "module": module, "text": text });
        replyText = removeMd(replyText);
    } else if ( modulesRegex.test(argument) ) {
        //=================================================================
        // User asked for a list of modules by type
        //=================================================================
        //var typePlural = argument.replace(/\command/, '');
        var typePlural =  argument.substring(1);
        var type = config.relationships[typePlural];
        var filteredModules = _.filter(modules, function(module){ return module.type === type; });
        var count = filteredModules.length;
        source = text['iterator-module-list'];
        source = utils.ensureString(source);
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command, "count": count, "modules": filteredModules });
    } else if ( readRegex.test(argument) ) {
        //=================================================================
        // User asked for a specific module by id
        //=================================================================
        var slug =  event.arguments[0];
        var moduleName = slug.replace(readRegex, '$1');
        var module = _.findWhere(modules, { simple_id: moduleName });
        var more = utils.checkForMore(module); 
        var full = utils.checkForFull(module); 
        user.currentModule = { "name": module.title, "simple_id": command + "read" + module.simple_id };
        source = text['action-module-read'];
        source = utils.ensureString(source);
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command, "module": module, "more": more, "full": full, "text": text});
    } if ( replyText !== '' ) {
        //=================================================================
        // If there's a replyText string, send it to the user
        //=================================================================
        couchlog.info('Received %s from %s', event.arguments[0], user.name, { "message_id": event.thread_id, "command":  event.arguments[0], "user": user.name, "response": s.truncate(replyText, 256) }); 
        api.sendMessage(replyText, event.thread_id);
    } else {
        source = text['error-no-such-command'];
        source = utils.ensureString(source);
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command });
        api.sendMessage(replyText, event.thread_id);
        couchlog.info('Received %s from %s', event.arguments[0], user.name, { "message_id": event.thread_id, "command":  event.arguments[0], "user": user.name, "response": "No command matched" }); 
    }
};
exports.unload = function() {
    exports.config.users = users;
};
