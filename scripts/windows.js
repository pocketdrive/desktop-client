let exec = require('child_process').exec;

let options = {
    name: 'Pocket Drive',
    icns: '/Applications/Electron.app/Contents/Resources/Electron.icns',
};

let mount = function (host, shareName, user, password, callBack) {
    shareName = '\\\\' + host + '\\' + shareName;

    let command = 'net use * ' + shareName + ' /user:' + user + ' ' + password;

    exec(command, function (error, stdout, stderr) {
        callBack(error);
    });
}

var unmount = function () {
    let dest = document.getElementById('dest').value;

    let command = 'umount ' + dest;

    sudo.exec(command, options, function (error, stdout, stderr) {
    });
}
