exports.test = function() {
    console.log('Running test...');
};

exports.loadUsers = function(config) {
    if ( config.hasOwnProperty("users") ) {
        return config.users;
    } else {
        // If it's not there, create it
        config.users = [ ];
        return config.users;
    }
};

exports.checkForMore = function(module) {
    if ( module['short-write-up'] !== undefined ) {
        return module;
    }
};

exports.checkForFull = function(module) {
    if ( module['full-write-up'] !== undefined ) {
        return module;
    }
};

exports.saveUniqueObjects = function(objects) {
    var list = {};

    for ( var i=0, len = objects.length; i < len ; i++ ) {
        list[objects[i].simple_id] = objects[i];
    }
    objects = [];
    for ( var key in list ) {
        objects.push(list[key]);
    }
    return objects;
};

exports.ensureString = function(source) {
    if ( source === undefined ) {
        // TODO really need to check the language first here, then return some hard-coded string
        // Return an alternate string
        source = "I've encountered a problem coming up with a response for you... please try again later.";
        return source;
    } else {
        // Return the original string
        return source;
    }
};

exports.currentModule = function(user) {
    if ( user.currentModule ) {
        return user;
    } else {
        return undefined;
    }
};
