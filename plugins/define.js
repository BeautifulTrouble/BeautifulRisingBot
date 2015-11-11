/*
    DESCRIPTION: 
        Define - defines terms used in Beautiful Rising and the bot

    AUTHOR: 

    COMMANDS:
        /define

    EXAMPLE:
        You: /define
        Bot: Definition of terms like Tactic, Principle, etc.
*/
var util = require('./../util');
var Handlebars = require('handlebars');
var define = function(){

    this.init = function(){

    };

    this.doStop = function(done){
        done();
    };

    this.doMessage = function (msg, reply){
        // Do we have a match on /help (options) ?
        var match = util.parseCommand(msg.text,"define");
        if (match) {
            // If so, compile a response
            var replyText = DefineTemplate(msg.chat);
            // And send it back to the user
            reply({type: 'text', text: '' + replyText});
        }
    };
};

var DefineSource = "Okay, {{first_name}}, let me help 👍: A tactic is a specific form of creative action, such as a flash mob or an occupation | A Principle is a design guideline for movement building and action planning | Big Ideas are big-picture concept and ideas that help us understand how the world works and how we might go about changing it. | Finally stories of resistance & change are capsules of successful and instructive creative actions, useful for illustrating how principles, tactics and big ideas can be successfully applied in practice. \n\n Would you like to access /tactics /principles /big_ideas /tools or /stories ?"
var DefineTemplate = Handlebars.compile(DefineSource);


module.exports = define;
