# Beautiful Rising Bot

> A Beautiful Rising Bot for Telegram, Skype, Facebook, Slack, and more

## Running the bot

Create a config.json with the necessary properties to access the various platforms.

Run the bot with `node main.js platform`, e.g., `node main.js telegram skype facebook`

This bot is just a module for the [Kassy](https://github.com/concierge/Kassy) multi-platform bot library.

And, if the Trello API token expires, then you will need to re-authenticate to Trello. Ideally, the first time you authenticate and generate a token, you should use the `expiration=never` parameters, e.g.: https://trello.com/1/connect?key=<PUBLIC_KEY>&name=MyApp&response_type=token?&expiration=never

## Adding a new route / plugin

* You can add additional functionality directly in the `/module/beautifulrising/beautifulrising.js` module;
* Or you can add it in a separate module or library

## TODO 

**Server:**
- [ ] Restart bot on server reboot [Adrian]

**Beautiful Rising module, high**
- [ ]
- [ ] If functionality doesn't exist, remove it (no incomplete stubs in master branch)
- [ ] Handle snapshot & gallery entries
- [ ] Strip markdown where it's not supported
- [ ] Speak Spanish (content)
- [ ] Speak Spanish (interface)
- [ ] Speak Arabic (content)
- [ ] Speak Arabic (interface)

**Beautiful Rising module, medium**
- [ ]
- [ ] Set up utility to send 'typing' response for longer queries
- [ ] Sending a card image if it exists
- [ ] Share modules
- [ ] Fix 'unique' on user.saved_modules
- [ ] Run /start on first connect

**Beautiful Rising module, low**
- [ ] Re-implement logging
- [ ] Add a /telegram route to provide information on what Telegram is (alias /security)
- [ ] Submit basic modules / ideas
- [ ] Beautiful Rising e-mail list subscription from whithin app

**Features to add to Kassy Telegram module:**
- [ ] Send image
- [ ] Send typing
- [ ] Send link

**Facebook-specific issues**
- [ ] Accepting friend requests
- [ ] Filtered messages
- [ ] Send HTML?

**Facebook Meseenger App-specific issues**
- [ ] 

**Skype-specific issues**
- [ ] Send HTML?

## Required commands / endpoints

(Note: the command prefix might not be a forward slash on all platforms. This is set in the config.json)

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

* `/stories`

* `/methodologies`

## Resource-specific navigation
Emojis can be used to visually provide UI feedback, e.g. More info, Save, Back

    
    * `/[:action][:id]` - Take action on resource ID, e.g., /readsomemodulenameslug
    * `/more`
    * `/full`
    * `/save`
    * `/share`


