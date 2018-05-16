const express = require('express')
const pings = require('./data-service')

const app = express()
const timeStampDay = 86400; // No of seconds in a day = UNIX timestamp day


// Mount middleware for logging
app.use((req, res, next) => {
    console.log( new Date().toLocaleString() + ' ' + req.method + ' ' + req.url + ' from '  + req.host);
    next();
  });

// Mount middleware for error handling
app.use((req, res, next, err) => {
    console.error(err.stack);
    res.status(500).send('Well Done! You broke the api');
  });

// POST clear_data
app.post('/clear_data', (req, res) => {
    pings.deleteMany({}, (err, result) => {
        if (err) { return console.log('failed to wipe data') }

        res.status(200).send('You just wiped all data :o');
    })
});

// POST /:deviceID/:epochTime
app.post('/:id/:time', (req, res) => {
    pings.findByIdAndUpdate(req.params.id, 
        { $push: { pings: req.params.time } }, 
        { upsert: true }, 
        (err, result) => {  
            if (err) { return console.log(err) }

            res.status(200).send('Added Ping');
    });
});

// GET /devices
app.get('/devices', (req, res) => {
    pings.find({}, '_id', (err, result) => {
        if (err) { return console.log('Error Encounterd in getting devices!') }
        // Transform device JSON array to device id list
        var deviceList = result.map(d => d._id);
        res.json(deviceList);
    })
});

// GET /all/:date
app.get('/all/:date', (req, res) => {
    var from = toTimeStamp(req.params.date);
    var to = from + timeStampDay;

    pings.findAllPings(from, to, (err, result) => { 
        res.json(transformJson(result));
    });
});

// GET /all/:from/:to
app.get('/all/:from/:to', (req, res) => {
    var from = toTimeStamp(req.params.from)
    var to = toTimeStamp(req.params.to)

    pings.findAllPings(from, to, (err, result) => { 
        res.json(transformJson(result));
    });   
});

// GET /:deviceID/:date
app.get('/:id/:date', (req, res) => {

    var from = toTimeStamp(req.params.date);
    var to = from + timeStampDay;

    pings.findPings(req.params.id, from, to, (err, result) => { 
        // Flatten JSON to list at API level rather than data service level
        res.json(flattenJson(result));
    });  
});

// GET /:deviceID/:from/:to
app.get('/:id/:from/:to', (req, res) => {
    var from = toTimeStamp(req.params.from)
    var to = toTimeStamp(req.params.to)

    pings.findPings(req.params.id, from, to, (err, result) => { 
        res.json(flattenJson(result));
    });
});

// All other routes return not found
app.use('',(req,res) =>{
    res.status(404).send('Error 404: The resource you are looking for was not found')
});

app.listen(3000);

// Helper : Returns UNIX timestamp(s) from a number or ISO string, NOT js timestamp(ms)
function toTimeStamp(value){
    var stamp = Number(value);
    // if value is not a number, parse as ISO date and return UNIX timestamp
    if (isNaN(stamp)) {
        
        return new Date(value).getTime() / 1000;
    }
    // if value is number, assume value to be timestamp. Note: I didn't do any validation checks as I felt they were out of scope
    return stamp;
}

// Helper : Transforms mongoose JSON result to return JSON type for all devices
function transformJson(value){
    var result = {};
    value.forEach(d => result[d._id] = d.pings);
    return result;
}

// Helper : Flattens mongoose JSON result to list of pings
function flattenJson(value){
    if (value.length == 0) return [];

    return value[0].pings;
}