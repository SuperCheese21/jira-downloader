const fs = require('fs');

const PATH = './output/attachments/';

fs.readdirSync(PATH).forEach(dir => {
    if (dir[0] !== '.') {
        fs.rmdir(PATH + dir);
    }
});
