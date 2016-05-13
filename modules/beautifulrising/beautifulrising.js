var Handlebars = require.safe('handlebars');
var request = require.safe('request');
var _ = require.safe('underscore');
var text;
var users = [];
var commandPrefix;

exports.match = function (event, commandPrefix) {
    command = commandPrefix;
    return event.arguments[0] === commandPrefix + 'start' 
        || event.arguments[0] === commandPrefix + 'menu' 
        || event.arguments[0] === commandPrefix + 'define';
};


exports.load = function() {
    var API_URL = "https://api.beautifulrising.org/api/v1";
    var url = API_URL + "/text/botflow";
    request.get(url, 
                function(error, response, body) {
                    text = JSON.parse(body);
                });
    //users = exports.config.users;
    console.log(users);
};
/*
   The main entry point of the module. This will be called by Kassy whenever the match function
   above returns true. In this basic example it simply replies with "hello world".
   */
exports.run = function(api, event) {
    console.log(event, api);
    var user = _.findWhere(users, { id: event.sender_id });
    if ( user === undefined ) {
        // First time user
        user = { id: event.sender_id, name: event.sender_name, first_seen: new Date() };
        users.push(user);
    } else {
        // Returning user
        user.returning = 1;
    }
        //console.log(text);
    var source = '';
    var template = '';
    var replyText = '';
    if ( event.arguments[0] === command + 'start' ) {
        source = text.start;
        console.log(source);
        template = Handlebars.compile(source);
        console.log(template);
        replyText = template({ "event": event, "config": "", "user": user });
        console.log(replyText);
    } else if ( event.arguments[0] === command + 'define' ) {
        console.log('here');
        source = text['menu-definition'];
        console.log(source);
        template = Handlebars.compile(source);
        console.log(template);
        replyText = template({ "event": event, "config": "", "user": user });
        console.log(replyText);
    }
    console.log(users);
    if ( replyText !== '' ) {
        api.sendMessage(replyText, event.thread_id);
    }
};

exports.unload = function() {
    console.log(users);
    //exports.config.users = users;

};
