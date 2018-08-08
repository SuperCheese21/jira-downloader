const fs = require('fs');

const PATH = './output/attachments/';

fs.readdirSync(PATH).forEach(dir => {
    if (dir[0] !== '.') {
        fs.rmdir(PATH + dir, err => {
            if (err) console.error(err.message);
            else console.log('Removed ' + dir);
        });
    }
});
