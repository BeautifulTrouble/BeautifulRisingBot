var config = {};

config.telegramToken = process.env.TELEGRAM_TOKEN;
config.trelloKey = process.env.TRELLO_KEY;
config.trelloToken = process.env.TRELLO_TOKEN;

config.activePlugins = ["start", "trello"];

module.exports = config;
