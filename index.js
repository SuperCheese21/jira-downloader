const rp = require('request-promise');
const credentials = require('./credentials.json');
const api = '/rest/api/latest/issue/CISCOSYS-872';
const auth = 'Basic ' + new Buffer(
    credentials.username + ':' + credentials.password
).toString('base64');

const options = {
    uri: credentials.domain + api,
    headers: {
        'User-Agent': 'Request-Promise',
        'Authorization': auth
    },
    json: true
};

rp(options)
    .then(body => {
        console.log(JSON.stringify(body, null, '\t'));
    })
    .catch(err => {
        console.error(err.message);
    });
