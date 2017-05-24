let sudo = require('sudo-prompt');
let options = {
    name: 'Pocket Drive',
    icns: '/Applications/Electron.app/Contents/Resources/Electron.icns',
};

let mount = function (shareName, user, password) {

    let command = 'mount -t cifs -o username=' + user + ',password=' + password + ' ' + src + ' ~/';

    sudo.exec(command, options, function(error, stdout, stderr) {});
}

var unmount = function() {
    let dest = document.getElementById('dest').value;

    let command = 'umount ' + dest;

    sudo.exec(command, options, function(error, stdout, stderr) {});
}
