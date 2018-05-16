var mongoose = require('mongoose');

// MongoDB hosted on Amazon EC2 Instance that I share with other test projects
mongoose.connect('mongodb://apiWorker2:P6wxjBBg7mEmESNQ@13.54.76.183/pings');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection Error'));

db.once('open', function () {
    console.log('Connection open');
});

// pings for each device are stored in a document with id and an array of pings as timestamps
var pingSchema = mongoose.Schema({
    _id: String,
    pings: [ Number ] 
});


// Query to retrieve pings for a specific device between two timestamps
pingSchema.statics.findPings = function (id, from, to, callback) {
    this.aggregate().match({_id: id}).project( { pings: {
        $filter: {
            input: "$pings",
            as: "ping",
            cond: { $and: [
               { $gte: [ "$$ping", from  ] },
               { $lt: [ "$$ping", to  ] }
             ] }
         }
    }
     }).exec(callback);
}

// Query to retrieve pings for all devices between two timestamps
pingSchema.statics.findAllPings = function ( from, to, callback) {
    this.aggregate().project( { pings: {
        $filter: {
            input: "$pings",
            as: "ping",
            cond: { $and: [
               { $gte: [ "$$ping", from  ] },
               { $lt: [ "$$ping", to  ] }
             ] }
         }
    }
     }).exec(callback);
}

var Pings = mongoose.model('Pings', pingSchema);

module.exports = Pings;