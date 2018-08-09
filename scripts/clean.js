const fs = require('fs');
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Ask user if they want to clear out attachments directory
rl.question('Do you want to delete everything in the attachments folder? (y/n): ', answer => {
    if (answer[0].toLowerCase() === 'y') {
        cleanDirectory('./output/attachments');
    }
    rl.close();
});

/**
 * Recursive function that removes all files and directories inside a directory
 * @param  {String} path Path to directory
 */
function cleanDirectory(path) {
    // Loop through each item in directory
    fs.readdirSync(path).forEach(item => {
        const fullPath = path + '/' + item;

        // Base case: item is a file
        if (fs.lstatSync(fullPath).isFile()) {
            // Remove file if not .placeholder
            if (item[0] !== '.') {
                fs.unlinkSync(fullPath);
                console.log('Removed ' + item);
            }
            return;
        }

        // Call self if item is a directory
        cleanDirectory(fullPath);

        // Remove directory after it is emptied
        fs.rmdirSync(fullPath);
    });
}

module.exports = cleanDirectory;
