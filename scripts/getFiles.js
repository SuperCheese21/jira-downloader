const { dialog } = require('electron').remote;
const settings = require('electron-settings');
const fs = require('fs');
const rp = require('request-promise');

const parseResponse = require('./parse');

const API = '/rest/api/latest/search';
const MAX_RESULTS = 500;    // Maximum number of issues to return

const cancelButton = document.getElementsByClassName('cancel-button')[0];

/**
 * Searches for issues matching a jql pattern and downloads attachments
 * @param  {Object} credentials Domain, username, and password for JIRA server
 * @param  {String} jql         JQL pattern to search
 */
async function getFiles(credentials, jql) {
    const headers = _getHeaders(credentials);
    const uri = credentials.domain + API;
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

    _updateMessage('Fetching issue data...');
    _showSpinner();

    rp(options)
        .then(body => {
            settings.set('credentials', credentials);
            _downloadFiles(headers, parseResponse(body.issues));
        })
        .catch(err => {
            _updateMessage('Error: Invalid credentials or JQL String.');
        });
}

/**
 * Creates a directory for each issue and initiates downloads
 * @param  {Array} issues  Array of issues with download links
 */
async function _downloadFiles(headers, issues) {
    const path = _selectOutputDirectory();
    const log = fs.createWriteStream(path + '/log.txt');   // Create log write stream
    fs.mkdirSync(path + '/attachments/');   // Create attachments directory

    let message = 'Done! Check log.txt for more info.';
    let cancel = false;
    cancelButton.addEventListener('click', () => {  // Add event listener to cancel button
        cancel = true;
    });

    _showProgressBar(); // show progress bar and hide download button

    // Loop through each issue in issues list
    issues:
    for (const [index, issue] of issues.entries()) {
        log.write('\n' + issue.key + '\n');
        const directory = path + '/attachments/' + issue.key;
        const progress = Math.round(100 * (index + 1) / issues.length);

        _updateProgressBar(progress);   // Update progress bar

        fs.mkdirSync(directory);    // Create directory

        // Loop through each attachment in attachments list
        files:
        for (const file of issue.list) {
            const fileSize = Math.round(file.size / 1000);
            log.write('  Downloading ' + file.filename + ' (' + fileSize + ' kb)...' + '\n');
            _updateMessage('Downloading ' + file.filename);
            await _download(headers, file.content, directory + '/' + file.filename, log);
            log.write('    Data written to ' + file.filename + '\n');
            if (cancel) {
                message = 'Download canceled';
                break issues;
            }
        }
    }

    log.end();  // End write stream

    _hideProgressBar(); // hide progress bar and show download button
    _updateMessage(message);
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
 * [_selectOutputDirectory description]
 * @return      {[type]} [description]
 */
function _selectOutputDirectory() {
    return dialog.showOpenDialog({
        buttonLabel: 'Select',
        properties: ['openDirectory'],
        message: 'Select a directory to download attachments to'
    })[0];
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
    _hideProgressBar();
    spinner.style.display = 'inline-block';
}

/**
 * [_hideProgressBar description]
 */
function _hideProgressBar() {
    const downloadButton = document.getElementsByClassName('download-button')[0];
    const progressBar = document.getElementsByClassName('progress-container')[0];

    progressBar.style.display = 'none';
    cancelButton.style.display = 'none';
    downloadButton.style.display = null;
}

/**
 * [_showProgressBar description]
 */
function _showProgressBar() {
    const downloadButton = document.getElementsByClassName('download-button')[0];
    const progressBar = document.getElementsByClassName('progress-container')[0];

    downloadButton.style.display = 'none';
    cancelButton.style.display = null;
    progressBar.style.display = null;

    _updateProgressBar(0);
}

module.exports = getFiles;
