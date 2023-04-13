// dependencies

const fs = require('fs');
const path = require('path');

const lib = {};

// base dir to data folder

lib.basepath = path.join(__dirname, '../.data/');

// Write file

lib.create = (dir, file, data, callback) => {
    // open file

    fs.open(`${lib.basepath + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // convert data to JSON
            const strData = JSON.stringify(data);
            // write Data and close
            fs.writeFile(fileDescriptor, strData, (err1) => {
                if (!err1) {
                    fs.close(fileDescriptor, (err2) => {
                        if (!err2) {
                            callback(false);
                        } else {
                            callback('Error closing new file');
                        }
                    });
                } else {
                    callback('Failed to writing data');
                }
            });
        } else {
            callback('cannot open file');
        }
    });
};

// Read file

lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basepath + dir}/${file}.json`, 'utf8', (err, data) => {
        callback(err, data);
    });
};

// Update file
lib.update = (dir, file, data, callback) => {
    // open file
    fs.open(`${lib.basepath + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // conver to stringify
            const strData = JSON.stringify(data);
            // truncate the file
            fs.ftruncate(fileDescriptor, (err3) => {
                if (!err3) {
                    // write file
                    fs.writeFile(fileDescriptor, strData, (err4) => {
                        if (!err4) {
                            // close file
                            fs.close(fileDescriptor, (err5) => {
                                if (!err5) {
                                    callback(false);
                                } else {
                                    callback('Error closing file');
                                }
                            });
                        } else {
                            callback('error writing file');
                        }
                    });
                } else {
                    callback('Error truncate file');
                }
            });
        } else {
            callback('Error opening file');
        }
    });
};

// Delete file

lib.delete = (dir, file, callback) => {
    // unlink file
    fs.unlink(`${lib.basepath + dir}/${file}.json`, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('Error deleting file!');
        }
    });
};

// get list from a directory
lib.getList = (dir, callback) => {
    fs.readdir(`${lib.basepath + dir}/`, (err, fileNames) => {
        if (!err && fileNames && fileNames.length > 0) {
            const trimmedFileNames = [];
            fileNames.forEach((fileName) => {
                trimmedFileNames.push(fileName.replace('.json', ''));
            });
            callback(false, trimmedFileNames);
        } else {
            callback('cannot read directory!');
        }
    });
};
// export module

module.exports = lib;
