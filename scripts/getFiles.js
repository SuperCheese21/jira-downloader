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

    _hideProgressBar();
    _updateMessage('Fetching issue data...');
    _showSpinner();

    rp(options)
        .then(body => {
            _updateMessage('Data fetched!');
            _downloadFiles(headers, parseResponse(body.issues));
        })
        .catch(err => {
            _updateMessage('Error: Invalid credentials or JQL String.');
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

    _showCancelButton();
    _showProgressBar();

    // Loop through each issue in issues list
    for (const [index, issue] of issues.entries()) {
        log.write('\n' + issue.key + '\n');
        const directory = path + '/attachments/' + issue.key;
        const progress = Math.round(100 * (index + 1) / issues.length);

        fs.mkdirSync(directory);    // Create directory

        _updateProgressBar(progress);

        // Loop through each attachment in attachments list
        for (const file of issue.list) {
            const fileSize = Math.round(file.size / 1000);
            log.write('  Downloading ' + file.filename + ' (' + fileSize + ' kb)...' + '\n');
            _updateMessage('Downloading ' + file.filename);
            await _download(headers, file.content, directory + '/' + file.filename, log);
            log.write('    Data written to ' + file.filename + '\n');
        }
    }

    log.end();  // End write stream

    _showDownloadButton();
    _updateMessage('Done! Check log.txt for more info.');
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
 * [_updateMessage description]
 * @param       {[type]} name [description]
 * @return      {[type]}      [description]
 */
function _updateMessage(name) {
    _hideSpinner();
    document.getElementById('message').innerHTML = name;
}

/**
 * [_updateProgressBar description]
 * @param       {Number} progress [description]
 */
function _updateProgressBar(progress) {
    const progressBar = document.getElementsByClassName('progress-bar')[0];
    const text = progress + "%";

    console.log(text);

    progressBar.style.width = text;
    progressBar.innerHTML = text;
}

/**
 * [_hideSpinner description]
 */
function _hideSpinner() {
    const spinner = document.getElementById('spinner');
    spinner.style.display = 'none';
}

/**
 * [_showSpinner description]
 */
function _showSpinner() {
    const spinner = document.getElementById('spinner');
    spinner.style.display = 'inline-block';
}

/**
 * [_hideProgressBar description]
 */
function _hideProgressBar() {
    const progressBar = document.getElementsByClassName('progress-container')[0];
    progressBar.style.display = 'none';
}

/**
 * [_showProgressBar description]
 */
function _showProgressBar() {
    const progressBar = document.getElementsByClassName('progress-container')[0];
    progressBar.style.display = 'block';
    _updateProgressBar(0);
}

/**
 * [_showDownloadButton description]
 */
function _showDownloadButton() {
    const downloadButton = document.getElementsByClassName('download-button')[0];
    const cancelButton = document.getElementsByClassName('cancel-button')[0];
    cancelButton.style.display = 'none';
    downloadButton.style.display = 'block';
}

/**
 * [_showDownloadButton description]
 */
function _showCancelButton() {
    const downloadButton = document.getElementsByClassName('download-button')[0];
    const cancelButton = document.getElementsByClassName('cancel-button')[0];
    downloadButton.style.display = 'none';
    cancelButton.style.display = 'block';
}

module.exports = getFiles;
