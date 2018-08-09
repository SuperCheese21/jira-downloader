const readline = require('readline');

const getFiles = require('./getIssues');

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const DEFAULT_JQL = 'project = CISCOBUG AND issuetype = Bug AND "Falcon ID (Cisco bugs)" = " ETSG_1805_1474_LME-105784_shaagrah "';

// Ask user to enter JQL string
rl.question('Enter the JQL string here: ', answer => {
    if (answer) {
        getFiles(answer);
    } else {
        getFiles(DEFAULT_JQL);
    }
    rl.close();
});
