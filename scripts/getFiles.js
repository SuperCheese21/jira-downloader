const _cliProgress = require('cli-progress');
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

const LOG_PATH = './output/log.txt';
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

    console.log('\nFetching issue data...');

    rp(options)
        .then(body => {
            console.log('  Issues fetched!');
            const files = parseResponse(body.issues);
            _downloadFiles(files);
        })
        .catch(err => {
            console.error('  Unable to fetch issues. Your JQL string may be invalid.');
        });
}

/**
 * Creates a directory for each issue and initiates downloads
 * @param  {Array} issues  Array of issues with download links
 */
async function _downloadFiles(issues) {
    const log = fs.createWriteStream(LOG_PATH);   // Create log write stream
    const bar = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);  // Create CLI progress bar

    console.log('\nDownloading attachments for ' + issues.length + ' issues...');

    bar.start(issues.length, 0);    // Start progress bar

    // Loop through each issue in issues list
    for (const [index, issue] of issues.entries()) {
        log.write('\n' + issue.key + '\n');
        const directory = './output/attachments/' + issue.key;

        fs.mkdirSync(directory);    // Create directory

        // Loop through each attachment in attachments list
        for (const file of issue.list) {
            const fileSize = Math.round(file.size / 1000);
            log.write('  Downloading ' + file.filename + ' (' + fileSize + ' kb)...' + '\n');
            await _download(file.content, directory + '/' + file.filename, log);
            log.write('    Data written to ' + file.filename + '\n');
        }

        bar.update(index + 1);  // Update progress bar
    }

    bar.stop(); // End progress bar
    log.end();  // End write stream

    console.log('\nDone\nCheck ' + LOG_PATH + ' for more info');
}

/**
 * Downloads file from url to specified path
 * @param  {String} url      File URL
 * @param  {String} path     Path to write file to
 * @param  {WriteStream} log Log write stream
 */
async function _download(url, path, log) {
    const options = {
        uri: url,
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

module.exports = getFiles;
