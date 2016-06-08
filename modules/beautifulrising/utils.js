exports.test = function() {
    console.log('Running test...');
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
