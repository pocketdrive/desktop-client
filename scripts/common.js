const storage = require('electron-json-storage');

let login = function () {
    let host = $('#host').val();
    let username = $('#username').val();
    let password = $('#password').val();

    $.ajax({
        type: "POST",
        url: "http://" + host + ":3000/sign-in",
        // The key needs to match your method's inpt paruameter (case-sensitive).
        data: JSON.stringify({'username': username, 'password': password}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if (data.success === true) {
                mount(host, data.sharename, data.user, data.password, function (error) {
                    if (error) {
                        alert(error);
                    } else {
                        console.log("Mount success");

                        // Save host and username to local storage
                        saveToLocalStorage('host', host);
                        saveToLocalStorage('username', username);
                        saveToLocalStorage('password', password);
                        saveToLocalStorage('smbUser', data.user);
                        saveToLocalStorage('smbPassword', data.password);
                        saveToLocalStorage('shareName', data.sharename);

                        // Load home page
                        remote.getCurrentWindow().loadURL(url.format({
                            pathname: path.join(__dirname, 'index.html'),
                            protocol: 'file:',
                            slashes: true
                        }))
                    }
                });

            } else {
                alert('Server error occurred');
                console.log(JSON.stringify(data));
            }
        },
        error: function () {
            alert("Error while connecting to remote device");
        }

    });

    return false;
}

function saveToLocalStorage(key, value) {
    storage.set(key, value, function (error) {
        if (error) {
            alert("Error occurred while saving " + key + " to local storage");
            console.log("Error occurred while saving " + key + " to local storage");
            console.log(error);
        }
    });
}