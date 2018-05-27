const express = require('express')

// const pings = require('./mongo-service')

// File based db
const fileService = require('./file-service')
var pings = new fileService('pings')


const app = express()
const timeStampDay = 86400; // No of seconds in a day = UNIX timestamp day
const port = 3000;


// Mount middleware for logging
app.use((req, res, next) => {
    console.log( new Date().toLocaleString() + ' ' + req.method + ' ' + req.url + ' from '  + req.hostname);
    next();
});

// Mount middleware for error handling
app.use((req, res, next, err) => {
    console.error(err);
    res.status(500).send('Well Done! You broke the api');
});

// Key for loader.io - load testing
app.get('/loaderio-39958608d7931daaa2be769e4e76a803/', (req, res) => {
    res.send('loaderio-39958608d7931daaa2be769e4e76a803');
});

// POST clear_data
app.post('/clear_data', (req, res) => {
    pings.deleteAll(err => {
        if (err) { return res.status(500).end(); /* return console.log('failed to wipe data') */ }

        res.status(200).send('You just wiped all data :o');
    })
});

// POST /:deviceID/:epochTime
app.post('/:id/:time', (req, res) => {
    pings.addPing(req.params.id, req.params.time, 
        (err, result) => {  
            if (err) { return res.status(500).end(); /* return console.log(err) */ }

            res.status(200).send('Added Ping');
    });
});

// GET /devices
app.get('/devices', (req, res) => {
    pings.getAllDevices((err, result) => {
        if (err) { 
            console.log('Error Encounterd in getting devices!'); 
            return res.status(500).end();   
        }
        return res.json(result);
    })
});

// GET /all/:date
app.get('/all/:date', (req, res) => {
    var from = toTimeStamp(req.params.date);
    var to = from + timeStampDay;

    pings.findAllPings(from, to, (err, result) => { 
        if (err) { console.log(err); return res.status(500).end();  }

        res.json(transformJson(result));
    });
});

// GET /all/:from/:to
app.get('/all/:from/:to', (req, res) => {
    var from = toTimeStamp(req.params.from)
    var to = toTimeStamp(req.params.to)

    pings.findAllPings(from, to, (err, result) => { 
        if (err) { return res.status(500).end(); /* return console.log(err) */ }

        res.json(transformJson(result));
    });   
});

// GET /:deviceID/:date
app.get('/:id/:date', (req, res) => {

    var from = toTimeStamp(req.params.date);
    var to = from + timeStampDay;

    pings.findPings(req.params.id, from, to, (err, result) => { 
        if (err) { return res.status(500).end(); /* return console.log(err) */ }

        // Flatten JSON to list at API level rather than data service level
        res.json(flattenJson(result));
    });  
});

// GET /:deviceID/:from/:to
app.get('/:id/:from/:to', (req, res) => {
    var from = toTimeStamp(req.params.from)
    var to = toTimeStamp(req.params.to)

    pings.findPings(req.params.id, from, to, (err, result) => {
        if (err) { return res.status(500).end(); /* return console.log(err) */ }
        
        res.json(flattenJson(result));
    });
});

// All other routes return not found
app.use('',(req,res) =>{
    res.status(404).send('Error 404: The resource you are looking for was not found')
});

app.listen(port);
console.log('Listening on port: ' + port);
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