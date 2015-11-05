/*
    DESCRIPTION: 
        Name - ...

    AUTHOR: 

    COMMANDS:
        Command

    EXAMPLE:
        You: input
        Bot: output
*/
var util = require('./../util');
var Handlebars = require('handlebars');
var moduleName = function(){

    this.init = function(){

    };

    this.doStop = function(done){
        done();
    };


    this.doMessage = function (msg, reply){
        // Do we have a match on /help (options) ?
        var match = util.parseCommand(msg.text,"...");
        if (match) {
            // If so, compile a response
            var replyText = HelpTemplate(msg.chat);
            // And send it back to the user
            reply({type: 'text', text: '' + replyText});
        }
    };

};

var Source = ""; 
var SourceTemplate = Handlebars.compile(HelpSource);

module.exports = moduleName;
