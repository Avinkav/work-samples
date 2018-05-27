var mongoose = require('mongoose');

// MongoDB hosted on Amazon EC2 Instance that I share with other test projects
mongoose.connect('mongodb://apiWorker2:P6wxjBBg7mEmESNQ@13.54.208.3/pings');

// mongoose.connect('mongodb://localhost/pings');

// MongoFB Atlas Cluster Amazon EC2 US-EAST high af latency
// mongoose.connect('mongodb+srv://api-worker:X40x7sy3zwjUCVZ7@tanda-ping-cluster-ttc1f.mongodb.net/test')
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


pingSchema.statics.addPing = function (id, timestamp, callback) {
    this.findByIdAndUpdate(id, 
        { $push: { pings: timestamp } }, 
        { upsert: true }).exec(callback); 
}

pingSchema.statics.findAllDevices = function (callback) {
    this.find({}, '_id').exec(callback);
            // Transform device JSON array to device id list
            var deviceList = result.map(d => d._id);
            res.json(deviceList);
}

var Pings = mongoose.model('Pings', pingSchema);

module.exports = Pings;