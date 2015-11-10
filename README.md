# Beautiful Rising Bot

> A Beautiful Rising Bot for Telegram

## Running the bot

`source setup.sh` to get the various API keys
`supervisor bot.js` or `forever bot.js`

Keep in mind, to run the bot you'll need to have the following:

* A connection to a content-providing API (currently in the Trello plugin)
* A connection to a couchdb instance (required in bot.js)

## Adding a new route / plugin

* Add your plugin in the `plugins` directory, e.g.: `plugins/magic.js`
* Load your plugin in the `config.js` file by adding it to the config.activePlugins array
* Restart the bot

## TODO 

For v1.0.0 "Bangladesh"
- [x] Explore the Trello API options
- [x] Output Bot version on /start
- [x] Add required commands (start, help, settings)
- [x] Add top-level navigation (menu, search)
- [x] Add resource listing commands
- [x] Add all getResource commands
- [x] Stub out resource action commands (more, save, share)
- [x] Add Bot description
- [x] Add Bot photo
- [x] Add Bot commands to BotFather
- [x] Add some emoji to make things cute and cuddly
- [x] Respond to messages that don't match a command (e.g., "Hi")
- [x] Functionality specific to user testing in Bangladesh, Uganda, etc. I.e., recording full user sessions for later review
- [x] Add Bot /setjoingroup /setprivacy

For v2.0.0 "Uganda" (November)
- [ ] Restart bot on server reboot [Adrian]
- [x] Migrate to [bot with plugins approach](https://github.com/crisbal/Node-Telegram-Bot) 
- [ ] Add in the introduction text from the session worksheet
- [ ] Log responses in addition to commands
- [ ] Set up utility to send 'typing' response for longer queries
- [ ] Simple session management to enable "Save" and other user-specific functionality, which will make some of the "returning user" map paths available.
- [ ] Enable /save functionality
- [ ] Sending a card image if it exists
- [ ] Add a /feedback route. Store feedback in CouchDB
- [ ] Add a /telegram route to provide information on what Telegram is (alias /security)
- [ ] If functionality doesn't exist, remove it (no incomplete stubs in master branch)

For v.3.0.0 "Mexico" (March)
- [ ] A 'QA' mode that enables special routes and logging specific to gathering QA data
- [ ] Speak Spanish!
- [ ] Share modules
- [ ] Submit basic modules / ideas
- [ ] Beautiful Rising e-mail list subscription from whithin app
- [ ] Migrate to Beautiful Rising API

## Required commands / endpoints

* `/start`

* `/help`

* `/settings`

## Top-level navigation


* `/menu` - Back to main menu

* `/define` - Define the types of modules in the toolkit

* `/search` - Search for a module

## Resource-listing navigation

* `/tactics`

* `/principles`

* `/bigideas`

* `/stories`

(Note: ForceReply for sort options if necessary)

## Resource-specific navigation

* `/[:resourcetype][:id]` - e.g., `/tactic12345`
Emojis can be used to visually provide UI feedback, e.g. More info, Save, Back
    
    * `/[:action][:id]` - Take action on resource ID
    * `/more`
    * `/save`
    * `/share`
