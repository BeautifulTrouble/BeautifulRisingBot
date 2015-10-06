# Beautiful Rising Bot

> A Beautiful Rising Bot for Telegram

## TODO 

For v1.0.0
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
- [ ] Sending a card image if it exists
- [ ] Simple session management to enable "Save" and other user-specific functionality, which will make some of the "returning user" map paths available.

For v2.0.0
- [ ] Once MVP is "done," migrate to [bot with plugins approach](https://github.com/crisbal/Node-Telegram-Bot) 

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
