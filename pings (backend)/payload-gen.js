const uuidv4 = require('uuid/v4');
var fs = require('fs');

const NO_OF_DEVICES = 1000;
const DATE_SPAN = 50;
const DATE_INTERVAL = 1;

Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}

var items = [];
var date = new Date();
for (let i = 0; i < NO_OF_DEVICES; i++) {
    let deviceId = uuidv4();
    for (let j = 0; j < DATE_SPAN; j += DATE_INTERVAL) {
        items.push([deviceId, Math.round(date.addDays(j) / 1000)])
    }
}

var variables = {};
variables["keys"] = ["device_id", "timestamp"];
variables["values"] = items;

var output =  {};
output["version"] = 1;
output["variables"] = variables;

fs.writeFileSync('payload.json', JSON.stringify(variables));

