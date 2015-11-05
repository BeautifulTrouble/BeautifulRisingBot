/*
    DESCRIPTION: 
        Menu - provide a menu to navigate the bot

    AUTHOR: 

    COMMANDS:
        /menu

    EXAMPLE:
        You: /menu
        Bot: Menu options
*/
var util = require('./../util');
var Handlebars = require('handlebars');
var menu = function(){

    this.init = function(){

    };

    this.doStop = function(done){
        done();
    };


    this.doMessage = function (msg, reply){
        // Do we have a match on /help (options) ?
        var match = util.parseCommand(msg.text,"menu");
        if (match) {
            // If so, compile a response
            var replyText = MenuTemplate(msg.chat);
            // And send it back to the user
            reply({type: 'text', text: '' + replyText});
        }
    };

};


var MenuSource = "The available commands are:\n" +
    "/define - Definitions for the types of the content\n" +
    "/search - Search for content by name\n" +
    "/big_ideas - List all Big ideas\n" +
    "/principles - List all Principles\n" +
    "/stories - List all Stories\n" +
    "/tactics - List all Tactics\n" +
    "/tools - List all Tools\n" +
    "";
var MenuTemplate = Handlebars.compile(MenuSource);

module.exports = menu;
