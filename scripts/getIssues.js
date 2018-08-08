const fs = require('fs');
const rp = require('request-promise');

const credentials = require('../config/credentials.json');
const api = '/rest/api/latest';
const headers = {
    'User-Agent': 'Request-Promise',
    'Authorization': 'Basic ' + new Buffer(
        credentials.username + ':' + credentials.password
    ).toString('base64')
};

const MAX_RESULTS = 500;    // Maximum number of issues to return

/**
 * Searches for issues matching a jql pattern
 * @param  {String} jql JQL pattern to search
 * @return {Promise}    Promise object for search results
 */
async function getSearch(jql) {
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
    return await rp(options);
}

/**
 * Creates a directory for each issue and initiates downloads
 * @param  {Array} issues  Array of issues with download links
 */
async function downloadFiles(issues) {
    for (const issue of issues) {
        console.log('Issue ' + issue.id + ' (' + issue.key + ')');
        const directory = './output/attachments/' + issue.key;
        fs.mkdirSync(directory);
        for (const file of issue.list) {
            console.log(' Downloading ' + file.filename + ' (' + file.size + ' bytes)...');
            await download(file.content, directory + '/' + file.filename);
            console.log('  Data written to ' + file.filename);
        }
    }
}

/**
 * Downloads file from url to specified path
 * @param  {String} url  File URL
 * @param  {String} path Path to write file to
 */
async function download(url, path) {
    const options = {
        uri: url,
        headers: headers
    };
    return await rp(options)
        .then(body => {
            fs.writeFile(path, body, err => {
                if (err) console.error(err.message);
            });
        })
        .catch(err => {
            console.error(err.message);
        });
}

module.exports = {
    getSearch,
    downloadFiles
};
