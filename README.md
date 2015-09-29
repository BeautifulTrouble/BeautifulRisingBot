# Beautiful Rising Bot

> A Beautiful Rising Bot for Telegram

## TODO 

- [x] Explore the Trello API options
- [x] Output Bot version on /start
- [x] Add required commands (start, help, settings)
- [x] Add top-level navigation (menu, search)
- [x] Add resource listing commands
- [x] Add all getResource commands
- [x] Stub out resource action commands (more, save, share)
- [x] Add Bot description
- [x] Add Bot photo
- [ ] Add Bot commands to BotFather
- [ ] Add Bot /setjoingroup /setprivacy
- [ ] Add some emoji to make things cute and cuddly

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
