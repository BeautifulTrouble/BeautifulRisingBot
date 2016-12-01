var Handlebars = require('handlebars');
var request = require('request');
var _ = require('underscore');
var s = require("underscore.string");
var removeMd = require('remove-markdown');
var Fuse = require('fuse.js');
var texts;
var modules;
var people;
var config;
var users = [];
var command;
var modulesRegex;
var readRegex;
var uniqueModules;
var utils = require('./utils.js');
var password = require('password');
var cradle = require('cradle'); // Persistance
var db = new(cradle.Connection)().database('_users');

// TODO move all of this to its own logging.js
// Set up logging
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
filelog.info('The bot was started or restarted');


// Handlebars helpers
Handlebars.registerHelper('uppercase', function(str) {
    return str.toUpperCase();
});

exports.match = function (event, commandPrefix) {
    command = commandPrefix;
    // All complex commands start with a regular expression
    modulesRegex = new RegExp("^" + commandPrefix + "tactics|stories|methodologies|principles|theories|people");
    readRegex    = new RegExp("^" + commandPrefix + "read(.*)$");
    var argument = event.arguments[0];
    // All basic commands get added here
    return event.arguments[0] === commandPrefix + 'start'
        || event.arguments[0] === commandPrefix + 'menu'
        || event.arguments[0] === commandPrefix + 'help'
        || event.arguments[0] === commandPrefix + 'define'
        || event.arguments[0] === commandPrefix + 'menu'
        || event.arguments[0] === commandPrefix + 'search'
        || event.arguments[0] === commandPrefix + 'settings'
        || event.arguments[0] === commandPrefix + 'save'
        || event.arguments[0] === commandPrefix + 'saved'
        || event.arguments[0] === commandPrefix + 'more'
        || event.arguments[0] === commandPrefix + 'full'
        || event.arguments[0] === commandPrefix + 'related'
        || event.arguments[0] === commandPrefix + 'images'
        || modulesRegex.test(argument)
        || readRegex.test(argument);
};


exports.load = function() {
    var API_URL = "https://api.beautifulrising.org/api/v1";
    var botflow = API_URL + "/text/botflow";
    var allEndpoint = API_URL + "/all";
    var modulesEndpoint = API_URL + "/modules";
    var methodologiesEndpoint = API_URL + "/methodologies";
    var principlesEndpoint = API_URL + "/principles";
    var storiesEndpoint = API_URL + "/stories";
    var tacticsEndpoint = API_URL + "/tactics";
    var theoriesEndpoint = API_URL + "/theories";
    var peopleEndpoint = API_URL + "/people";
    var configEndpoint = API_URL + "/config";
    // Get the bot-related objects from the API
    request.get(botflow,
                function(error, response, body) {
                    // TODO Language can be controlled through this variable
                    // E.g., text['en'] text['ar'] ...
                    texts = JSON.parse(body);
                });
    // Get the module objects from the API
    // TODO remove this ridiculousness when there's a /modules endpoint 
    request.get(modulesEndpoint,
        function(error, response, body) {
            var modulesNoId = JSON.parse(body);
            filelog.info('All modules loaded');
            // Create a simpleId from the slug & add it to the objects
            var modulesAll = _.map(modulesNoId, function(module) {
                var slug = module.slug;
                var simpleId = slug.replace(/-/ig, '');
                module.simple_id = simpleId;
                return module;
            });
            modules = _.reject(modulesAll, function(module) { 
                    // Get rid of snapshots and gallery entries
                    return module['module-type'] === 'snapshot';
            });
            console.debug("We have " + modules.length + " modules");
    });
    // Get the people objects from the API
    request.get(peopleEndpoint,
                function(error, response, body) {
                    people = JSON.parse(body);
                });
    // Get the config object from the API
    request.get(configEndpoint,
                function(error, response, body) {
                    config = JSON.parse(body);
                });
    db.view('users/all', function (err, res) {
        if ( err && err.error === 'not_found' ) {
            // If the view is not there, create it!
            db.save('_design/users', {
                all: {
                    map: function (doc) {
                        if (doc.name) emit(doc.name, doc);
                    }
                },
            });
        }
    });
};

var processMessage = function(api, event, record) {
    var user = record;
    var argument = event.arguments[0];
    var source = '';
    var template = '';
    var replyText = '';
    var currentModule = user.currentModule;
    // If the user has set a language, use it, otherwise EN
    var language  = user.language || 'en';
    text = texts[language];
    if ( event.arguments[0] === command + 'start' ) {
        //=================================================================
        // User sent /start command (could send this always for new users)
        //=================================================================
        var returning;
        if ( user.returning === 1 ) {
            returning = 'true';
        }
        source = text['action-start'];
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command, "returning": returning });
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
    } else if ( event.arguments[0] === command + 'menu' || event.arguments[0] === command + 'help' ) {
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
        filelog.info("The query was: " + query);
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
        var savedModules  = user.saved_modules || [];
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
    } else if ( event.arguments[0] === command + 'related' ) {
        //=================================================================
        // User sent /related command
        //=================================================================
        // TODO this work is incomplete because we are not exposing the /related option yet
        // TODO need to add a utility function to inflate related modules and add them to the module object
        // TODO flag a module as having related content, so this menu item can be exposed
        if ( utils.currentModule(user) === undefined ) {
            // No current module, return an error
            source = text['error-no-current-module'];
            module = {};
        } else {
            module = _.findWhere(modules, { "title": currentModule.name });
            source = text['action-module-related-modules'];
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
        var type = config['singular-name-for-type'][typePlural];
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
        var more;
        var full;
        // Do we even have a module to work with?
        if ( module === undefined ) {
            source = text['error-no-current-module'];
        } else {
            more = utils.checkForMore(module);
            full = utils.checkForFull(module);
            user.currentModule = { "name": module.title, "simple_id": command + "read" + module.simple_id };
            source = text['action-module-read'];
        }
        source = utils.ensureString(source);
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command, "module": module, "more": more, "full": full, "text": text});
    } if ( replyText !== '' ) {
        //=================================================================
        // If there's a replyText string, send it to the user
        //=================================================================
        //
        // Log the response
        couchlog.info('Received %s from %s', event.arguments[0], user.name, { "message_id": event.thread_id, "command":  event.arguments[0], "user": user.name, "response": s.truncate(replyText, 256) });
        // Send it to the user
        api.sendMessage(replyText, event.thread_id);
        // Mark the user as returning
        user.returning = 1;
        // Increment that we saw the user
        user.interactions++;
    } else {
        // Right now, this will not fire becasue of the loop it creates with Skype
        source = text['error-no-such-command'];
        source = utils.ensureString(source);
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command });
        // Log the response
        couchlog.info('Received %s from %s', event.arguments[0], user.name, { "message_id": event.thread_id, "command":  event.arguments[0], "user": user.name, "response": "No command matched" });
        // Send it to the user
        // Mark the user as returning
        user.returning = 1;
        // Increment that we saw the user
        user.interactions++;
        api.sendMessage(replyText, event.thread_id);
    }
    db.save(user.id, user.rev, user, function(err, res) { // Persist the user
        if (err) {
            filelog.info(err);
        } else {

        }
    });
};

exports.run = function(api, event) {
    var userFullName = event.sender_name + '-' + event.sender_id;
    var userFullId = 'org.couchdb.user:' + userFullName;
    db.get(userFullId, function (err, doc) {
        if ( err ) {
            filelog.info(err);
            if (err.error === 'not_found') { // No user, create one
                user = { // Object that we want to persist
                    sender_id: event.sender_id,
                    name: userFullName,
                    name_pretty: event.sender_name,
                    first_seen: new Date(),
                    platform: event.event_source,
                    currentModule: "",
                    savedModules: [],
                    returning: 0,
                    interactions: 0,
                    password: password(3),
                    roles: ['bot_user'],
                    type: "user" };
                    // Note: to put a new user in CouchDB's _users table
                    // the documentid and name must match
                    db.save(userFullId, user, function(err, res) {
                        if (err) {
                            filelog.info(err);
                        } else {
                            module.exports.run(api, event);
                        }
                    });
            }
        } else {
            processMessage(api, event, doc);
        }
    });
};


exports.unload = function() {
            filelog.info("The beautifulrising module is shutting down");
};
