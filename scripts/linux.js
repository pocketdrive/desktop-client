let exec = require('child_process').exec;
let sudo = require('sudo-prompt');
let options = {
    name: 'Pocket Drive',
    icns: '/Applications/Electron.app/Contents/Resources/Electron.icns',
};

let mount = function (host, shareName, user, password) {
    shareName = '//' + host + '/' + shareName;

    let command1 = 'mkdir -p ~/PocketDrive';
    let command2 = 'mount -t cifs -o username=' + user + ',password=' + password + ' ' + shareName + ' ~/PocketDrive';

    exec(command1, function(error, stdout, stderr){
        if(error){
            alert(stderr);
        }
    });

    console.log(command2);

    sudo.exec(command2, options, function(error, stdout, stderr) {
        if(error){
            alert(stderr);
        } else{
            alert('Mount success');
        }
    });
}

var unmount = function() {
    let dest = document.getElementById('dest').value;

    let command = 'umount ' + dest;

    sudo.exec(command, options, function(error, stdout, stderr) {});
}
