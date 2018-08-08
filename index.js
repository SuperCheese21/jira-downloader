const fs = require('fs');

const getSearch = require('./getIssues');
const parseResponse = require('./parse');

getSearch('project = CISCOSYS AND resolution = Unresolved ORDER BY priority DESC, updated DESC')
    .then(body => {
        console.log('Issues: ' + body.issues.length);
        body.issues.forEach(issue => {
            console.log(' ' + issue.key);
        });
        const attachments = parseResponse(body.issues);
        fs.writeFile('./attachments.json', JSON.stringify(attachments, null, '\t'), err => {
            if (err) console.error(err.message);
            else console.log('Data written to file');
        });
    })
    .catch(err => {
        console.error(err.message);
    });
