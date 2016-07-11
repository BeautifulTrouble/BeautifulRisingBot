var cradle = require('cradle'); // Persistance
var db = new(cradle.Connection)().database('_users');

exports.test = function() {
    console.log('Running test...');
};


// CouchDB functions, not used for now
exports.loadUsers = function(config) {
};


exports.returnUsers = function() {
};

exports.userSave = function(user) {
};

exports.checkForMore = function(module) {
    if ( module['short-write-up'] !== undefined ) {
        return module;
    }
};

exports.checkForFull = function(module) {
    if ( module['full-write-up'] !== undefined ) {
        // TODO remove this when the docs are fixed
        // ... currently, there's content in full-write-up in snapshots & galleries,
        // so we'll skip anything that has that in the document_title for now
        if ( module.document_title.match(/SNAPSHOT/g) === null && module.document_title.match(/GALLERY/g) === null ) {
            return module;
        }
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
