/*
    DESCRIPTION: 
        Help - ...

    AUTHOR: 

    COMMANDS:
        Help

    EXAMPLE:
        You: help
        Bot: Helpful text
*/
var util = require('./../util');
var Handlebars = require('handlebars');
var help = function(){

    this.init = function(){

    };

    this.doStop = function(done){
        done();
    };


    this.doMessage = function (msg, reply){
        // Do we have a match on /help (options) ?
        var match = util.parseCommand(msg.text,"help");
        if (match) {
            // If so, compile a response
            var replyText = HelpTemplate(msg.chat);
            // And send it back to the user
            reply({type: 'text', text: '' + replyText});
        }
    };

};

var HelpSource = "Okay, {{first_name}}, I can help.\n" + 
    "The available commands are:\n" +
    "/define - Definitions for the types of the content\n" +
    "/search - Search for content by name\n" +
    "/big_ideas - List all Big ideas\n" +
    "/principles - List all Principles\n" +
    "/stories - List all Stories\n" +
    "/tactics - List all Tactics\n" +
    "/tools - List all Tools\n" +
    "";
var HelpTemplate = Handlebars.compile(HelpSource);

module.exports = help;
