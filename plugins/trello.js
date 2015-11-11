/*
    DESCRIPTION: 
       Access Trello cards

    AUTHOR: 

    COMMANDS:
        stories
        tactics
        principles
        tools
        big_ideas
        search

    EXAMPLE:
        ...
*/
var config = require('./../config');
var util = require('./../util');
var Handlebars = require('handlebars');
var Trello = require('node-trello');
var _ = require('underscore');
var slugify = require("underscore.string/slugify");
var capitalize = require("underscore.string/capitalize");
var archieml = require('archieml');


var trello = function(){

    var TRELLO_KEY = config.trelloKey;
    var TRELLO_TOKEN = config.trelloToken;
    var board = {};

    this.check = function(){
        if(TRELLO_KEY === "")
            return false;
        if(TRELLO_TOKEN === "")
            return false;
        return true;
    };

    this.init = function(){
        t = new Trello(TRELLO_KEY, TRELLO_TOKEN);        
        // Use Trello as the API for now, modules are cards
        // Lets just story the cards for now, as they don't change often
        board.cards = []; // An array for the cards
        // Load the cards when the app starts
        t.get("/1/boards/awhXkqQu/cards", { cards: "open" }, function(err, data) {
            if (err) throw err;
            data.forEach(function(el) {
                // Add the labels as a property of the card object
                el.labels.forEach(function(l) {
                    var label = l.name.toLowerCase();
                    label = label.replace(/\W/, '_');
                    el["label_" + label] = true;
                });
                board.cards.push(el);
            });
        });
    };

    this.doStop = function(done){
        done();
    };


    this.doMessage = function (msg, reply){
        var replyText = '';
        var filteredList = {};
        var searchCards = util.parseCommand(msg.text,"search");
        // Search and a search term
        if ( searchCards ) {
            if ( searchCards.length > 1 ) {
                searchRegExp = new RegExp(searchCards[1] , 'i');
                 // Create a filtered collection of cards from user's search
                filteredList.searchTerm = searchCards[1];
                filteredList.cards = [];
                filteredList.cards = board.cards.filter(function(card){
                    return searchRegExp.test(card.name);
                });
                replyText = SearchResultsTemplate(filteredList);
                reply({type: 'text', text: '' + replyText});

            }
            // Only search, no term
            if ( searchCards.length === 1 ) {
                replyText = SearchEmptyTemplate(msg.chat);
                reply({type: 'text', text: '' + replyText});
            
            }
        }
        var listCards = util.parseCommand(msg.text,["stories","tactics","big_ideas","principles","tools"]);
        if (listCards) {
            var type = listCards[0];
            var typeName = capitalize(type);
            // Fix up the big_ideas label
            typeName = typeName.replace(/_/, ' ');
            // Create a filtered collection of cards based on the type requested
            filteredList.moduleType = type;
            filteredList.moduleTypeName = typeName;
            filteredList.cards = [];
            filteredList.cards = board.cards.filter(function(el) {
                return el["label_" + type] === true &&
                    // Only if it's not in list 552fe48327ca601d7b2d2453
                    // Or in list  55a82fb3bdf8ada2fa42dd88
                    // Per conversation with Dave
                    el.idList != '552fe48327ca601d7b2d2453' &&
                    el.idList != '55a82fb3bdf8ada2fa42dd88';
                    // Only "Game card" labelled cards for now
                    // Not used for now, using lists above instead
                    //el.label_game_card == true;
            });
            replyText = ModuleListTemplate(filteredList);
            reply({type: 'text', text: '' + replyText});
        }
        var getCard = msg.text.match(/^\/(\d+)$/);
            var id = getCard[1];
        if ( getCard )  {
            var found = board.cards.reduce(function(found, el){
                return found || (el.idShort == id && el);
            },null);
            if ( found ) { 
                // TODO implement these accessors
                // Return a menu
                //var opts = {
                    //reply_markup: JSON.stringify({
                        //one_time_keyboard: true,
                        //resize_keyboard: true,
                        //keyboard: [
                            //['Full Read', 'Media'],
                            //['Challenges', 'Campaigns']
                        //],
                    //})
                //};
                var cardData = archieml.load(found.desc);
                found.cardData = cardData;
                replyText = ModuleDetailTemplate(found);
                // Send the menu
                //bot.sendMessage(chatId, reply_text, opts );
                reply({type: 'text', text: '' + replyText});
            } else { 
                reply({type: 'text', text: 'Did not find a module or card matching that ID' });
            }
        }
    };

};

// Module (card) list
var ModuleListSource = "{{#if cards.length}}{{moduleTypeName}} available:\n" + 
    "{{#cards}}➡️ {{{name}}}: Reply with /{{idShort}}  more. \n{{/cards}}" + 
    "{{else}}No {{moduleTypeName}} cards avaialble{{/if}}";
var ModuleListTemplate = Handlebars.compile(ModuleListSource);

// Module (card) detail
var ModuleDetailSource = "{{{name}}}\n" + 
    "{{#if cardData.in_sum}}{{{cardData.in_sum}}}\n" +
    "By {{{cardData.author}}}\n" +
    "Google Doc: {{cardData.g_doc}}\n" +
    "{{else}}No card data available{{/if}}";
var ModuleDetailTemplate = Handlebars.compile(ModuleDetailSource);

// Module (card) search results
var SearchResultsSource = "{{#if cards.length}}Matching cards for '{{searchTerm}}':\n" + 
    "{{#cards}}➡️ {{{name}}}: Reply with /{{idShort}}  more. \n{{/cards}}" + 
    "{{else}}No matching cards found for {{searchTerm}}. 😪{{/if}}";
var SearchResultsTemplate = Handlebars.compile(SearchResultsSource);

// Search is empty
var SearchEmptySource   = "It doesn't look like you entered a search term. Try, for example, '/search poverty'";
var SearchEmptyTemplate = Handlebars.compile(SearchEmptySource);

module.exports = trello;
