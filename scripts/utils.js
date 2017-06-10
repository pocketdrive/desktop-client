const storage = require('electron-json-storage');

function saveToLocalStorage(key, value) {
    storage.set(key, value, function (error) {
        if (error) {
            alert("Error occurred while saving " + key + " to local storage");
            console.log("Error occurred while saving " + key + " to local storage");
            console.log(error);
        }
    });
}

function readFromLocalStorage(key) {
    storage.get(key, function (error, data) {
        if (error) {
            alert("Error occurred while reading " + key + " from local storage");
            console.log("Error occurred while reading " + key + " from local storage");
            console.log(error);
        } else{
            return data;
        }
    });
}