let {pathExistsSync, copySync} = require('fs-extra');

if (!pathExistsSync('./.yo-rc.json')) {
    copySync('./yo-rc.json', './.yo-rc.json');
}
