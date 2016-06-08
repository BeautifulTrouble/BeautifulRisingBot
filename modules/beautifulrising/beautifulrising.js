var Handlebars = require.safe('handlebars');
var request = require.safe('request');
var _ = require.safe('underscore');
var removeMd = require.safe('remove-markdown');
var Fuse = require.safe('fuse.js');
var text;
var modules;
var config;
var users = [];
var commandPrefix;
var modulesRegex;
// Helpers to be written
//
// getCurrentModule
// saveModule
// setLanguage
// removeMarkdown
var utils = require('./utils.js');

exports.match = function (event, commandPrefix) {
    command = commandPrefix;
    // All complex commands start with a regular expression
    modulesRegex = new RegExp("^" + commandPrefix + "tactics|stories|methodologies|principles");
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
        || event.arguments[0] === commandPrefix + 'more'
        || event.arguments[0] === commandPrefix + 'full'
        || event.arguments[0] === commandPrefix + 'images'
        || modulesRegex.test(argument)
        || readRegex.test(argument);
};


exports.load = function() {
    // TODO 
    // If undefined, create this
    users = exports.config.users;
    console.log(users);

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
            console.log('Got the modules');
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
    //console.log(event, api);
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
        var query = event.arguments[1];
        console.log(query);
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
        var results = fuse.search(query);
        console.log(results.length);
        var resultsCount = results.length;
        // TODO move this to a function that iterates through modules and handles the display of each
        // TODO move this string to botflow Google Doc + Handlebars
        replyText = "I've found " + resultsCount + " modules for you:\n";
        _.each(results, function(module) { 
            replyText += module.title + "\n➡ " + command + "read" + module.simple_id + "\n";
        });
        
    } else if ( event.arguments[0] === command + 'settings' ) {
        //=================================================================
        // User sent /settings command
        //=================================================================
        // TODO 
    } else if ( event.arguments[0] === command + 'save' ) {
        //=================================================================
        // User sent /save command
        //=================================================================
        // TODO check for currentModule --> Move to function
        var savedModules  = user.saved_modules;
        savedModules.push(currentModule);
        // TODO unique on slug or title
        uniqueModules = _.unique(savedModules);
        user.saved_modules = [];
        user.saved_modules = uniqueModules;
        //user.saved_modules.push(currentModule);
        source = text['action-save'] || 'Alternate template';
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command });
    } else if ( event.arguments[0] === command + 'more' ) {
        //=================================================================
        // User sent /more command
        //=================================================================
        // TODO check for currentModule --> Move to function
        module = _.findWhere(modules, { "title": currentModule.name });
        source = module['short-write-up'] || 'Alternate template';
        // TODO need a utility to check for source, or provide alternate template
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command });
        replyText = removeMd(replyText);
    } else if ( event.arguments[0] === command + 'full' ) {
        //=================================================================
        // User sent /more command
        //=================================================================
        // TODO check for currentModule --> Move to function
        module = _.findWhere(modules, { "title": currentModule.name });
        // TODO need a utility to check for source, or provide alternate template
        source = module['full-write-up'] || 'Alternate template';
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command });
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
        // TODO move this to a function that iterates through modules and handles the display of each
        // TODO move this string to botflow Google Doc + Handlebars
        replyText = "I've found " + count + " modules for you:\n";
        _.each(filteredModules, function(module) { 
            replyText += module.title + "\n➡ " + command + "read" + module.simple_id + "\n";
        });
    } else if ( readRegex.test(argument) ) {
        //=================================================================
        // User asked for a specific module by id
        //=================================================================
        var slug =  event.arguments[0];
        var moduleName = slug.replace(readRegex, '$1');
        var module = _.findWhere(modules, { simple_id: moduleName });
        user.currentModule = { "name": module.title, "simple_id": command + "read" + module.simple_id };
        replyText = module.title + "\n" + module.snapshot;
        // TODO send /more or /full based on what properties are present
    } if ( replyText !== '' ) {
        //=================================================================
        // If there's a replyText string, send it to the user
        //=================================================================
        api.sendMessage(replyText, event.thread_id);
    }
};
exports.unload = function() {
    console.log(users);
    exports.config.users = users;
};
