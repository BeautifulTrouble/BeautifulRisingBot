# Beautiful Rising Bot

> A Beautiful Rising Bot for Telegram, Skype, Facebook, Slack, and more

## Running the bot

Create a config.json with the necessary properties to access the various platforms.

Run the bot with `node main.js platform`, e.g., `node main.js telegram skype facebook`

This bot is just a module for the [Kassy](https://github.com/concierge/Kassy) multi-platform bot library.

## Adding a new route / plugin

* You can add additional functionality directly in the `/module/beautifulrising/beautifulrising.js` module;
* Or you can add it in a separate module or library

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


