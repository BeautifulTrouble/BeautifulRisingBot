exports.match = function(event, commandPrefix) {
	return event.body === commandPrefix + 'restart';
};

exports.run = function(api, event) {
	var msg = 'Admin: restart procedure requested....';
	api.sendMessage(msg, event.thread_id);
	this.shutdown(StatusFlag.ShutdownShouldRestart);
	return false;
};

exports.help = function(commandPrefix) {
	//return [[commandPrefix + 'restart','Restarts the platform', 'If restart fails manual intervention may be required.']];
};
