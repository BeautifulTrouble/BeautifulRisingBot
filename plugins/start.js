/*
    DESCRIPTION: 
        Start - ...

    AUTHOR: 

    COMMANDS:
        start

    EXAMPLE:
        You: start
        Bot: start text
*/
var util = require('./../util');
var Handlebars = require('handlebars');
var start = function(){

    this.init = function(){

    };

    this.doStop = function(done){
        done();
    };


    this.doMessage = function (msg, reply){
        // Do we have a match on /start (options) ?
        var match = util.parseCommand(msg.text,"start");
        if (match) {
            // If so, compile a response
            var replyText = StartTemplate(msg.chat);
            // And send it back to the user
            var opts = {
                reply_markup: JSON.stringify({
                    one_time_keyboard: true,
                    resize_keyboard: true,
                    keyboard: [
                        ['/tactics', '/principles'],
                        ['/big_ideas', '/stories'],
                        ['/tools', '/define'],
                    ],
                })
            };
            reply({type: 'text', text: '' + replyText, opts: opts });
        }
    };

};

// Start
var StartSource = "Hello {{first_name}} {{last_name}},\n" +
    "You've reached the Beautiful Rising Bot!\n" +
    "\n" +
    //"This bot can speak English, Arabic, and Esperanto.\n" +
    //"You can change this with /settings (not actually implemented yet)\n" +
    //"\n" +
    "You can use /help to get a list of all commands.\n" +
    "\n" +
    "You can start by choosing one of the available types of resources on the keyboard below, " +
    "or type /define to get a definition of what's available. 😊";
var StartTemplate = Handlebars.compile(StartSource);

module.exports = start;
