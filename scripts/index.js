const { getSearch, downloadFiles } = require('./getIssues');
const parseResponse = require('./parse');

getSearch('project = CISCOBUG AND issuetype = Bug AND "Falcon ID (Cisco bugs)" = " ETSG_1805_1474_LME-105784_shaagrah "')
    .then(body => {
        const files = parseResponse(body.issues);
        downloadFiles(files);
    })
    .catch(err => {
        console.error(err.message);
    });
