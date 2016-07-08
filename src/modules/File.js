var Logger = require('./Logger');
var requireCondition = require('./Decorators').requireCondition;
/**
 * File module
 * @module src/modules/File
 * @type {Object}
 * @see https://github.com/apache/cordova-plugin-file
 * @requires ./Utils.js
 */
var File = {};

File.LOG = new Logger('ALL', '[File - module]');
window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

/**
 * ERROR_MAP
 * Stargate.file.ERROR_MAP
 * */
File.ERROR_MAP = {
    1: 'NOT_FOUND_ERR',
    2: 'SECURITY_ERR',
    3: 'ABORT_ERR',
    4: 'NOT_READABLE_ERR',
    5: 'ENCODING_ERR',
    6: 'NO_MODIFICATION_ALLOWED_ERR',
    7: 'INVALID_STATE_ERR',
    8: 'SYNTAX_ERR',
    9: 'INVALID_MODIFICATION_ERR',
    10: 'QUOTA_EXCEEDED_ERR',
    11: 'TYPE_MISMATCH_ERR',
    12: 'PATH_EXISTS_ERR'
};

File.currentFileTransfer = null;

/**
 * File.resolveFS
 *
 * @param {String} url - the path to load see cordova.file.*
 * @returns {Promise<Entry|FileError>}
 * */
File.resolveFS = function(url){
    return new Promise(function(resolve, reject){
        window.resolveLocalFileSystemURL(url, resolve, reject);
    });
};

/**
 * File.appendToFile
 *
 * @param {String} filePath - the filepath file:// url like
 * @param {String|Blob} data - the string to write into the file
 * @param {String} [overwrite=false] - overwrite
 * @param {String} mimeType: text/plain | image/jpeg | image/png
 * @returns {Promise<String|FileError>} where string is a filepath
 */
File.appendToFile = function(filePath, data, overwrite, mimeType){
    // Default
    overwrite = arguments[2] === undefined ? false : arguments[2];
    mimeType = arguments[3] === undefined ? 'text/plain' : arguments[3];
    
    return File.resolveFS(filePath)
        .then(function(fileEntry){
            return new Promise(function(resolve, reject){
                fileEntry.createWriter(function(fileWriter) {
                    if (!overwrite){
                        fileWriter.seek(fileWriter.length);
                    }

                    var blob;
                    if (!(data instanceof Blob)){
                        blob = new Blob([data], { type: mimeType });
                    } else {
                        blob = data;
                    }

                    fileWriter.write(blob);
                    fileWriter.onerror = reject;
                    fileWriter.onabort = reject;
                    fileWriter.onwriteend = function(){
                        resolve(__transform([fileEntry]));
                    };
                }, reject);
            });

        });
};

/**
 * File.readFileAsHTML
 * @param {String} indexPath - the path to the file to read
 * @returns {Promise<Document|FileError>}
 */
File.readFileAsHTML = function(indexPath){

    return File.readFile(indexPath)
        .then(function(documentAsString){
            return new window.DOMParser().parseFromString(documentAsString, 'text/html');
        });
};

/**
 * File.readFileAsJSON
 * @param {String} indexPath - the path to the file to read
 * @returns {Promise<Object|FileError>}
 */
File.readFileAsJSON = function(indexPath){
    return File.readFile(indexPath)
        .then(function(documentAsString){
            try {
                return Promise.resolve(window.JSON.parse(documentAsString));
            } catch(e){
                return Promise.reject(e);
            }
        });
};

/**
 *  File.removeFile
 *
 *  @param {String} filePath - file://
 *  @returns {Promise<String|FileError>}
 * */
File.removeFile = function(filePath){
    return File.resolveFS(filePath)
        .then(function(fileEntry){
            return new Promise(function(resolve, reject){
                fileEntry.remove(function(result){
                    resolve(result === null || result === 'OK');
                }, reject);
            });
        });
};

/**
 *  File.removeDir
 *
 *  @param {String} dirpath - the directory entry to remove recursively
 *  @returns Promise<void|FileError>
 * */
File.removeDir = function(dirpath){
    return File.resolveFS(dirpath)
        .then(function(dirEntry){
            return new Promise(function(resolve, reject){
                dirEntry.removeRecursively(function(result){
                    resolve(result === null || result === 'OK');
                }, reject);
            });
        });
};

/**
 *  File._promiseZip
 *
 *  @private
 *  @param {String} zipPath - the file to unpack
 *  @param {String} outFolder - the folder where to unpack
 *  @param {Function} _onProgress - the callback called with the percentage of unzip progress
 *  @returns Promise<boolean>
 * */
File._promiseZip = function(zipPath, outFolder, _onProgress){

    LOG.d('PROMISEZIP:', arguments);
    return new Promise(function(resolve, reject){
        window.zip.unzip(zipPath, outFolder, function(result){
            if (result === 0){
                resolve(true);
            } else {
                reject(result);
            }
        }, _onProgress);
    });
};

/**
 * File.download
 *
 * @param {String} url - the URL of the resource to download
 * @param {String} filepath - a directory entry type object where to save the file
 * @param {String} saveAsName - the name with the resource will be saved
 * @param {Function} _onProgress - a progress callback function filled with the percentage from 0 to 100
 * @returns {Promise}
 * */
File.download = function(url, filepath, saveAsName, _onProgress){
    var self = this;
    this.ft = new window.FileTransfer();
    this.ft.onprogress = _onProgress;
    File.currentFileTransfer = self.ft;

    self.promise = new Promise(function(resolve, reject){
        self.ft.download(window.encodeURI(url), filepath + saveAsName,
            function(entry){
                resolve(__transform([entry]));
                self.ft = null;
            },
            function(reason){
                reject(reason);
                self.ft = null;
            },
            true // trustAllHosts
        );
    });
};

/**
 * File.createDir
 *
 * @param {String} dirPath - a file:// like path
 * @param {String} subFolderName
 * @returns {Promise<String|FileError>} - return the filepath created
 * */
File.createDir = function(dirPath, subFolderName){
    return File.resolveFS(dirPath)
        .then(function(dirEntry){
            return new Promise(function(resolve, reject){
                dirEntry.getDirectory(subFolderName, { create: true }, function(entry){
                    resolve(__transform([entry]));
                }, reject);
            });
        });
};

/**
 *  File.fileExists
 *
 *  @param {String} url - the toURL path to check
 *  @returns {Promise<boolean|void>}
 * */
File.fileExists = function(url){
    return new Promise(function(resolve){
        window.resolveLocalFileSystemURL(url, function(entry){

            resolve(entry.isFile);

        }, function(fileError){
            resolve(fileError.code !== 1);
        });
    });
};

/**
 *  File.dirExists
 *
 *  @param {String} url - the toURL path to check
 *  @returns {Promise<boolean|void>}
 * */
File.dirExists = function(url){
    return new Promise(function(resolve){
        window.resolveLocalFileSystemURL(url, function(entry){

            resolve(entry.isDirectory);

        }, function(fileError){

            resolve(fileError.code != 1);
        });
    });
};

/**
 * File.requestFileSystem
 *
 * @param {int} TYPE - 0 == window.LocalFileSystem.TEMPORARY or 1 == window.LocalFileSystem.PERSISTENT
 * @param {int} size - The size in bytes for example 5*1024*1024 == 5MB
 * @returns {Promise}
 * */
File.requestFileSystem = function(TYPE, size) {
    return new Promise(function (resolve, reject) {
        window.requestFileSystem(TYPE, size, resolve, reject);
    });
};

/**
 * File.readDir
 *
 * @param {String} dirPath - a directory path to read
 * @returns {Promise<Array>} - returns an array of Object files
 * */
File.readDir = function(dirPath){
    return File.resolveFS(dirPath)
        .then(function(dirEntry){
            return new Promise(function(resolve, reject){
                var reader = dirEntry.createReader();
                reader.readEntries(function(entries){
                    LOG.d('readDir:', entries);
                    resolve(__transform(entries));
                }, reject);
            });
        });
};

/**
 * File.readFile
 *
 * @param {String} filePath - the file entry to readAsText
 * @returns {Promise<String|FileError>}
 */
File.readFile = function(filePath) {

    return File.resolveFS(filePath)
        .then(function(fileEntry){
            return new Promise(function(resolve, reject){
                fileEntry.file(function(file) {
                    var reader = new FileReader();
                    reader.onerror = reject;
                    reader.onabort = reject;

                    reader.onloadend = function() {
                        var textToParse = this.result;
                        resolve(textToParse);
                    };
                    reader.readAsText(file);
                    // readAsDataURL
                    // readAsBinaryString
                    // readAsArrayBuffer
                });
            });
        });
};

/**
 * File.createFile
 *
 * @param {String} directory - filepath file:// like string
 * @param {String} filename - the filename including the .txt
 * @returns {Promise<FileEntry|FileError>}
 * */
File.createFile = function(directory, filename){
    return File.resolveFS(directory)
        .then(function(dirEntry){
            return new Promise(function(resolve, reject){
                dirEntry.getFile(filename, { create: true }, function(entry){
                    resolve(__transform([entry]));
                }, reject);
            });
        });
};

/**
 * write a file in the specified path
 *
 * @param {String} filepath - file:// path-like
 * @param {String|Blob} content
 * @returns {Promise<Object|FileError>}
 * */
File.write = function(filepath, content){
    return File.appendToFile(filepath, content, true);
};

/**
 * moveDir
 *
 * @param {String} source
 * @param {String} destination
 * @returns {Promise<FileEntry|FileError>}
 * */
File.moveDir = function(source, destination){
    var newFolderName = destination.substring(destination.lastIndexOf('/') + 1);
    var parent = destination.replace(newFolderName, '');
    
    LOG.d('moveDir:', parent, newFolderName);
    return Promise.all([File.resolveFS(source), File.resolveFS(parent)])
        .then(function(entries){
            LOG.d('moveDir: resolved entries', entries);
            return new Promise(function(resolve, reject){
                entries[0].moveTo(entries[1], newFolderName, resolve, reject);
            });
        });
};

/**
 * copyFile
 * @param {String} source
 * @param {String} destination
 * @returns {Promise<FileEntry|FileError>}
 * */
File.copyFile = function(source, destination){
    var newFilename = destination.substring(destination.lastIndexOf('/') + 1);
    var parent = destination.replace(newFilename, '');

    return Promise.all([File.resolveFS(source), File.resolveFS(parent)])
        .then(function(entries){
            // TODO: check if are really files
            LOG.d('copyFileTo', entries);
            return new Promise(function(resolve, reject){
                entries[0].copyTo(entries[1], newFilename, resolve, reject);
            });
        });
};

/**
 * copyDir
 * @param {String} source
 * @param {String} destination
 * @returns {Promise<FileEntry|FileError>}
 * */
File.copyDir = function(source, destination){
    var newFolderName = destination.substring(destination.lastIndexOf('/') + 1);
    var parent = destination.replace(newFolderName, '');

    return Promise.all([File.resolveFS(source), File.resolveFS(parent)])
        .then(function(entries){
            LOG.d('copyDir', source, 'in', destination);
            return new Promise(function(resolve, reject){
                entries[0].copyTo(entries[1], newFolderName, resolve, reject);
            });
        });
};

/**
 * getMetadata from FileEntry or DirectoryEntry
 * @param path {String} - the path string
 * @returns {Promise<Object|FileError>}
 */
File.getMetadata = function(path){
    return File.resolveFS(path)
                .then(function(entry){
                    return new Promise(function(resolve, reject){
                        entry.getMetadata(resolve, reject);
                    });                        
                });
};

/**
 * __transform utils function
 * @private
 * @param {Array} entries - an array of Entry type object
 * @returns {Array.<Object>} - an array of Object
 * */
function __transform(entries){
    var arr = entries.map(function(entry){
        return {
            fullPath: entry.fullPath,
            path: entry.toURL(),
            internalURL: entry.toInternalURL ? entry.toInternalURL() : '',
            isFile: entry.isFile,
            isDirectory: entry.isDirectory
        };
    });
    return (arr.length === 1) ? arr[0] : arr;
}

function checkPlugins(){
    return window.resolveLocalFileSystemURL && window.zip;
}

Object.keys(File).map((methodName) => {
    File[methodName] = requireCondition(checkPlugins, 
                                        File[methodName], 
                                        null,
                                        'Check cordova-plugin-file and zip', 
                                        'warn');
});

module.exports = File;