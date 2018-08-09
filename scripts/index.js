const readline = require('readline');

const getFiles = require('./getIssues');

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Ask user to enter JQL string
rl.question('Enter the JQL string here: ', answer => {
    if (answer) {
        getFiles(answer);
    } else {
        getFiles('');
    }
    rl.close();
});
