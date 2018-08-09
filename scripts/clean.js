const fs = require('fs');

const PATH = './output/attachments';

function cleanDirectory(path) {
    fs.readdirSync(path).forEach(item => {
        const fullPath = path + '/' + item;
        if (fs.lstatSync(fullPath).isDirectory()) {
            cleanDirectory(fullPath);
            fs.rmdirSync(fullPath);
            console.log('Removed ' + item);
        } else {
            fs.unlinkSync(fullPath);
            console.log(' Removed ' + item);
        }
    });
}

cleanDirectory(PATH);
