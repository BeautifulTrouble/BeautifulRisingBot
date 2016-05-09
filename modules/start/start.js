var Handlebars = require.safe('handlebars');

/*
	The main entry point of the module. This will be called by Kassy whenever the match function
	above returns true. In this basic example it simply replies with "hello world".
*/
exports.run = function(api, event) {
        console.log(event);
        console.log(event.sender_name.first_name);
        console.log(api);
        var replyText = StartTemplate({ "message": "" });
	api.sendMessage(replyText, event.thread_id);
};

var StartSource = "Hello {{ message.first_name }} {{ message.last_name }},\n\n" +
"Welcome to the first beta version ({{ config.version }}) of the Beautiful Rising ChatBot!\n\n" +
"Our chatbot is a responsive “chat service” for the Beautiful Rising toolbox, it offers " +
"stories, big ideas, principles and tactics in the form of a conversation right on your " +
"smartphone. While we have a working prototype ready, we need your help to refine this " +
"chat service to best meet your needs and address your surrounding challenges. " +
"Why? Because we don't want to create something for you – we want to create something with you. " +
"With your input, we can test our assumptions to be sure our chatbot serves as a practical, " +
"useful, and effective resource for activism.\n\n" +
"So what do we need? We’re asking for your participation in a co-creation session.\n\n" +
"* Before you start interacting with the chat bot make sure the voice recorder is turned on " +
"and recording – this is for internal use only.\n\n" +
"* We’d like you to interact with it for as long as you'd like – preferably at least 10 minutes." +
" During your interaction, use the designated card to jot down any unclear words so we can improve " +
"the language. We also encourage you to verbalize your thought process, explaining how you’re feeling, " +
"what's confusing, what’s working etc for the recording.\n\n" +
"Once the interaction is complete, please fill out six quick questions that inquire " +
"about your co-creation session.\n\n" +
"That's it! Thank you for being part of this process. We truly value and appreciate your input.\n\n" +
"This chatbot will be available throughout the jam session, so feel free to test it and use " +
"it again after your session is complete. We welcome all feedback!\n\n" +
"Please note: All of the information you provide in this session will only be visible to the " +
"internal Beautiful Rising team. It won't be used in any way or form except to enhance this toolbox.\n\n" +
"------------------------------------\n\n" +
"Okay, let's get started:\n\n" +
"You can use /help to get a list of all commands.\n\n" +
"You can start by choosing one of the available types of resources on the keyboard below, " +
"or reply with /define to get a definition of what's available.";
var StartTemplate = Handlebars.compile(StartSource);
