const $ = require('jquery');
const { dialog } = require('electron').remote;
const settings = require('electron-settings');
const fs = require('fs');
const rp = require('request-promise');

const parseResponse = require('./parse');

const API = '/rest/api/latest/search';
const MAX_RESULTS = 500;    // Maximum number of issues to return

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
    $('.cancel-button').click(() => {
        message = 'Download canceled';
        cancel = true;
    });

    _showProgressBar(); // show progress bar and hide download button

    // Loop through each issue in issues list
    issues:
    for (const [index, issue] of issues.entries()) {
        const directory = path + '/attachments/' + issue.key;
        const progress = Math.round(100 * (index + 1) / issues.length);

        log.write('\n' + issue.key + '\n');
        _updateProgressBar(progress);   // Update progress bar

        fs.mkdirSync(directory);    // Create directory

        // Loop through each attachment in attachments list
        files:
        for (const file of issue.list) {
            log.write('  Downloading ' + file.filename + ' (' + Math.round(file.size / 1000) + ' kb)...' + '\n');
            _updateMessage('Downloading ' + file.filename);
            await _download(headers, file.content, directory + '/' + file.filename, log);
            log.write('    Data written to ' + file.filename + '\n');

            if (cancel) break issues;
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
    console.log('_updateMessage(' + name + ')');
    $('#spinner').css('display', 'none');
    $('#message').text(name);
    console.log('');
}

/**
 * [_updateProgressBar description]
 * @param       {Number} progress [description]
 */
function _updateProgressBar(progress) {
    console.log('_updateProgressBar(' + progress + ')');
    const text = progress + "%";
    $('.progress-bar')
        .css('width', text)
        .text(text);
}

/**
 * [_showSpinner description]
 */
function _showSpinner() {
    console.log('_showSpinner()');
    _hideProgressBar();
    $('#spinner').css('display', 'inline-block');
}

/**
 * [_hideProgressBar description]
 */
function _hideProgressBar() {
    console.log('_hideProgressBar()');
    $('.progress-container, .cancel-button').css('display', 'none');
    $('.download-button').css('display', null);
}

/**
 * [_showProgressBar description]
 */
function _showProgressBar() {
    console.log('_showProgressBar()');
    $('.download-button').css('display', 'none');
    $('.cancel-button, .progress-container').css('display', null);
    _updateProgressBar(0);
}

module.exports = getFiles;
