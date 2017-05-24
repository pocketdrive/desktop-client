let exec = require('child_process').exec;

let options = {
    name: 'Pocket Drive',
    icns: '/Applications/Electron.app/Contents/Resources/Electron.icns',
};

let mount = function (shareName, user, password) {

    let command = 'net use * ' + shareName +  ' /user:' + user + ' ' + password;
    console.log(command);

    exec(command, function(error, stdout, stderr){
        if(error){
            alert(stderr);
        } else{
            alert("Mount success");
        }
    });
}

var unmount = function() {
    let dest = document.getElementById('dest').value;

    let command = 'umount ' + dest;

    sudo.exec(command, options, function(error, stdout, stderr) {});
}
