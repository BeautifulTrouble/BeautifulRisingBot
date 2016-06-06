var Handlebars = require.safe('handlebars');
var request = require.safe('request');
var _ = require.safe('underscore');
var removeMd = require.safe('remove-markdown');
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
    request.get(botflow, 
        function(error, response, body) {
            text = JSON.parse(body);
    });
    request.get(modulesEndpoint, 
        function(error, response, body) {
            console.log('Got the modules');
            var modulesNoId = JSON.parse(body);
            modules = _.map(modulesNoId, function(module) {
                var slug = module.slug;
                var simpleId = slug.replace(/-/ig, '');
                module.simple_id = simpleId;
                return module;
        });
    });
    request.get(configEndpoint, 
        function(error, response, body) {
            config = JSON.parse(body);
    });
};

exports.run = function(api, event) {
    console.log(event, api);
    var argument = event.arguments[0];
    var user = _.findWhere(users, { id: event.sender_id });
    if ( user === undefined ) {
        // First time user
        user = { id: event.sender_id, name: event.sender_name, first_seen: new Date(), saved_modules: [] };
        users.push(user);
    } else {
        // Returning user
        user.returning = 1;
    }
    //console.log(text);
    var source = '';
    var template = '';
    var replyText = '';
    var currentModule = user.currentModule;
    if ( event.arguments[0] === command + 'start' ) { // Handle /start
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
    } else if ( event.arguments[0] === command + 'menu' ) { // Menu
        //=================================================================
        // User sent /menu command
        //=================================================================
        source = text['action-menu'];
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command });
        // TODO 
    } else if ( event.arguments[0] === command + 'search' ) { // Search
        //=================================================================
        // User sent /setting command
        //=================================================================
        // TODO 
    } else if ( event.arguments[0] === command + 'settings' ) { // Search
        //=================================================================
        // User sent /settings command
        //=================================================================
        // TODO 
    } else if ( event.arguments[0] === command + 'save' ) { // Search
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
        console.log(user);
        console.log('Text: ' + text );
        source = text['action-save'] || 'Alternate template';
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command });
    } else if ( event.arguments[0] === command + 'more' ) {
        //=================================================================
        // User sent /more command
        //=================================================================
        // TODO check for currentModule --> Move to function
        module = _.findWhere(modules, { "title": currentModule.name });
        console.log(module);
        source = module['short-write-up'] || 'Alternate template';
        console.log(source);
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
        console.log(module);
        // TODO need a utility to check for source, or provide alternate template
        source = module['full-write-up'] || 'Alternate template';
        console.log(source);
        template = Handlebars.compile(source);
        replyText = template({ "event": event, "config": "", "user": user, "command": command });
        replyText = removeMd(replyText);

    } else if ( modulesRegex.test(argument) ) {
        //=================================================================
        // User asked for a list of modules by type
        //=================================================================
        console.log(command);
        //var typePlural = argument.replace(/\command/, '');
        var typePlural =  argument.substring(1);
        console.log(typePlural);
        var type = config.relationships[typePlural];
        var filteredModules = _.filter(modules, function(module){ return module.type === type; });
        var count = filteredModules.length;
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
        console.log(moduleName);
        var module = _.findWhere(modules, { simple_id: moduleName });
        user.currentModule = { "name": module.title, "simple_id": command + "read" + module.simple_id };
        replyText = module.title + "\n" + module.snapshot;
        // TODO send /more or /full based on what properties are present
        console.log(user);
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
