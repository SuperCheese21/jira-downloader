const fs = require('fs');
const rp = require('request-promise');

const credentials = require('../config/credentials.json');
const parseResponse = require('./parse');

const api = '/rest/api/latest';
const headers = {
    'User-Agent': 'Request-Promise',
    'Authorization': 'Basic ' + new Buffer(
        credentials.username + ':' + credentials.password
    ).toString('base64')
};
const log = fs.createWriteStream('./output/log.txt');   // Create log write stream

const MAX_RESULTS = 500;    // Maximum number of issues to return

/**
 * Searches for issues matching a jql pattern
 * @param  {String} jql JQL pattern to search
 * @return {Promise}    Promise object for search results
 */
async function getFiles(jql) {
    const options = {
        uri: credentials.domain + api + '/search',
        qs: {
            jql: jql,
            startAt: 0,
            maxResults: MAX_RESULTS,
            fields: 'key,attachment'
        },
        headers: headers,
        json: true
    };

    console.time('time');   // Start timer

    rp(options)
        .then(body => {
            const files = parseResponse(body.issues);
            _downloadFiles(files);
        })
        .catch(err => {
            console.error(err.message);
        });
}

/**
 * Creates a directory for each issue and initiates downloads
 * @param  {Array} issues  Array of issues with download links
 */
async function _downloadFiles(issues) {
    // Loop through each issue in issues list
    for (const issue of issues) {
        _printData('\n' + issue.key, console.log);
        const directory = './output/attachments/' + issue.key;

        fs.mkdirSync(directory);    // Create directory

        // Loop through each attachment in attachments list
        for (const file of issue.list) {
            const fileSize = Math.round(file.size / 1000);
            _printData('  Downloading ' + file.filename + ' (' + fileSize + ' kb)...', console.log);
            await _download(file.content, directory + '/' + file.filename);
            _printData('    Data written to ' + file.filename, console.log);
        }
    }

    log.end();  // End write stream

    console.timeEnd('time');    // Stop timer
}

/**
 * Downloads file from url to specified path
 * @param  {String} url  File URL
 * @param  {String} path Path to write file to
 */
async function _download(url, path) {
    const options = {
        uri: url,
        encoding: null,
        headers: headers
    };
    return await rp(options)
        .then(body => {
            fs.writeFile(path, body, err => {
                if (err) _printData(err.message, console.error);
            });
        })
        .catch(err => {
            _printData(err.message, console.error);
        });
}

/**
 * Prints data to both the log and console
 * @param       {String} content        Data to print
 * @param       {function} consoleWrite Console print function
 */
function _printData(content, consoleWrite) {
    log.write(content + '\n');
    consoleWrite(content);
}

module.exports = getFiles;
