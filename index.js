const { getSearch, downloadFiles } = require('./getIssues');
const parseResponse = require('./parse');

getSearch('project = CISCOSYS AND resolution = Unresolved ORDER BY priority DESC, updated DESC')
    .then(body => {
        console.log('Issues: ' + body.issues.length);
        body.issues.forEach(issue => {
            console.log(' ' + issue.key);
        });
        const files = parseResponse(body.issues);
        downloadFiles(files);
    })
    .catch(err => {
        console.error(err.message);
    });
