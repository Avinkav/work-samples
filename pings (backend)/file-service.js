const fs = require('fs-extra');
const klaw = require('klaw')
const through2 = require('through2')


function fileService(rootPath) {
    this.rootPath = rootPath;
}

fileService.prototype.addPing = function (id, timestamp, callback) {
    // File system indexing logic
    // Break guid into 4 segments at dash
    var pathedId = id.replace(/-/ig,'/')
    // Insertion logic
    fs.ensureDir(`${this.rootPath}/${pathedId.substring(0, 24)}`, err => {if (err) throw err})
    fs.appendFile(`${this.rootPath}/${pathedId}.csv`, timestamp.concat(","), callback);
}

fileService.prototype.getAllDevices = function (callback) {
    // File system indexing logic
    const items = [] // files, directories, symlinks, etc
    klaw(this.rootPath)
    .pipe(excludeDirFilter)
      .on('data', item => {
          items.push(item.path)
    })
      .on('end', () => {
          console.dir(items);
          callback(null, items);
        })   
}

fileService.prototype.deleteAll = function (callback) {
    fs.emptyDir(`${this.rootPath}`, callback);
}

const excludeDirFilter = through2.obj(function (item, enc, next) {
    if (!item.stats.isDirectory()) this.push(item)
    next()
  })
  

module.exports = fileService;