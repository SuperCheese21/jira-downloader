const fs = require('fs');
const rp = require('request-promise');

const credentials = require('./credentials.json');
const api = '/rest/api/latest';
const headers = {
    'User-Agent': 'Request-Promise',
    'Authorization': 'Basic ' + new Buffer(
        credentials.username + ':' + credentials.password
    ).toString('base64')
};

const MAX_RESULTS = 500;

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

async function downloadFiles(issues) {
    issues.forEach(issue => {
        fs.mkdirSync('./output/attachments/' + issue.key);
    });
}

module.exports = {
    getSearch,
    downloadFiles
};
