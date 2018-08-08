const rp = require('request-promise');
const credentials = require('./credentials.json');
const api = '/rest/api/latest';
const headers = {
    'User-Agent': 'Request-Promise',
    'Authorization': 'Basic ' + new Buffer(
        credentials.username + ':' + credentials.password
    ).toString('base64')
};

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
            maxResults: 500,
            fields: 'key,attachment'
        },
        headers: headers,
        json: true
    };
    return await rp(options);
}

module.exports = getSearch;
