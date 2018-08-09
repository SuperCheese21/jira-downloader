const fs = require('fs');

const PATH = './output/attachments/';

fs.readdirSync(PATH).forEach(dir => {
    if (dir[0] !== '.') {
        fs.readdirSync(PATH + dir).forEach(file => {
            fs.unlinkSync(PATH + dir + '/' + file);
            console.log(' Removed ' + file);
        });
        fs.rmdirSync(PATH + dir);
        console.log('Removed ' + dir);
    }
});
