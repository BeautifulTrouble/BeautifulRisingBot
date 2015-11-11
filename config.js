var config = {};

config.version = "v2.0.0";
config.telegramToken = process.env.TELEGRAM_TOKEN;
config.trelloKey = process.env.TRELLO_KEY;
config.trelloToken = process.env.TRELLO_TOKEN;

config.activePlugins = ["start", "help", "define", "menu", "trello"];
//config.activePlugins = ["start", "help", "define", "menu"];

module.exports = config;
