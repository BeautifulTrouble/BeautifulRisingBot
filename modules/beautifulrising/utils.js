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
