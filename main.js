//noinspection JSUnusedLocalSymbols
const {app, BrowserWindow, remote} = require('electron');
const url = require('url');
const path = require('path');

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({width: 800, height: 600})
    // mainWindow.setMenu(null);

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'login.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})