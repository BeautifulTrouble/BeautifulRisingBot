/*
    DESCRIPTION: 
        Settings - ...

    AUTHOR: 

    COMMANDS:
        settings

    EXAMPLE:
        You: /settings
        Bot: Information on how to set settings...
*/
var util = require('./../util');
var Handlebars = require('handlebars');
var settings = function(){

    this.init = function(){

    };

    this.doStop = function(done){
        done();
    };


    this.doMessage = function (msg, reply){
        // Do we have a match on /help (options) ?
        var match = util.parseCommand(msg.text,"settings");
        if (match) {
            // If so, compile a response
            var replyText = HelpTemplate(msg.chat);
            // And send it back to the user
            reply({type: 'text', text: '' + replyText});
        }
    };

};

var SettingsSource = ""; 
var SettingsTemplate = Handlebars.compile(SettingsSource);

module.exports = settings;
