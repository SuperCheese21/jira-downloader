const { dialog } = require('electron').remote;
const fs = require('fs');
const rp = require('request-promise');

const parseResponse = require('./parse');

const API = '/rest/api/latest';
const MAX_RESULTS = 500;    // Maximum number of issues to return

/**
 * Searches for issues matching a jql pattern and downloads attachments
 * @param  {Object} credentials Domain, username, and password for JIRA server
 * @param  {String} jql         JQL pattern to search
 */
async function getFiles(credentials, jql) {
    const headers = _getHeaders(credentials);
    const uri = credentials.domain + API + '/search';
    const options = {
        uri: uri.includes('://') ? uri : 'https://' + uri,
        qs: {
            jql: jql,
            startAt: 0,
            maxResults: MAX_RESULTS,
            fields: 'key,attachment'
        },
        headers: headers,
        json: true
    };

    rp(options)
        .then(body => {
            console.log('  Issues fetched!');
            fs.writeFile('./config/credentials.json', JSON.stringify(credentials, null, '\t'), err => {
                if (err) console.error(err);
            });
            const issues = parseResponse(body.issues);
            _downloadFiles(headers, issues);
        })
        .catch(err => {
            console.error('  Unable to fetch issues. Your credentials or JQL string may be invalid.');
        });
}

/**
 * [_createOutputDirectory description]
 * @return      {[type]} [description]
 */
function _createOutputDirectory() {
    return dialog.showOpenDialog({
        buttonLabel: 'Select',
        properties: ['openDirectory'],
        message: 'Select a directory to download attachments to'
    })[0];
}

/**
 * Creates a directory for each issue and initiates downloads
 * @param  {Array} issues  Array of issues with download links
 */
async function _downloadFiles(headers, issues) {
    const path = _createOutputDirectory();
    const log = fs.createWriteStream(path + '/log.txt');   // Create log write stream

    fs.mkdirSync(path + '/attachments/');   // Create attachments directory

    // Loop through each issue in issues list
    for (const [index, issue] of issues.entries()) {
        log.write('\n' + issue.key + '\n');
        const directory = path + '/attachments/' + issue.key;

        fs.mkdirSync(directory);    // Create directory

        _updateProgressBar(index + 1, issues.length);

        // Loop through each attachment in attachments list
        for (const file of issue.list) {
            const fileSize = Math.round(file.size / 1000);
            log.write('  Downloading ' + file.filename + ' (' + fileSize + ' kb)...' + '\n');
            _updateCurrentFile('Downloading ' + file.filename);
            await _download(headers, file.content, directory + '/' + file.filename, log);
            log.write('    Data written to ' + file.filename + '\n');
        }
    }

    log.end();  // End write stream

    console.log('\nDone\nCheck log.txt for more info');
}

/**
 * Downloads file from url to specified path
 * @param  {String} uri      File URI
 * @param  {String} path     Path to write file to
 * @param  {WriteStream} log Log write stream
 */
async function _download(headers, uri, path, log) {
    const options = {
        uri: uri,
        encoding: null,
        headers: headers
    };
    return await rp(options)
        .then(body => {
            fs.writeFile(path, body, err => {
                if (err) log.write(err.message + '\n');
            });
        })
        .catch(err => {
            log.write(err.message + '\n');
        });
}

/**
 * [_getHeaders description]
 * @param       {[type]} credentials [description]
 * @return      {[type]}             [description]
 */
function _getHeaders(credentials) {
    return {
        'User-Agent': 'Request-Promise',
        'Authorization': 'Basic ' + new Buffer(
            credentials.username + ':' + credentials.password
        ).toString('base64')
    };
}

/**
 * [_updateProgressBar description]
 * @param       {[type]} value [description]
 * @param       {[type]} total [description]
 * @return      {[type]}       [description]
 */
function _updateProgressBar(value, total) {
    const bar = document.getElementById('progressBar');
    bar.value = 100 * (value / total);
}

/**
 * [_updateCurrentFile description]
 * @param       {[type]} name [description]
 * @return      {[type]}      [description]
 */
function _updateCurrentFile(name) {
    document.getElementById('currentFile').innerHTML = name;
}

module.exports = getFiles;
