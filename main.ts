import {app, BrowserWindow, screen} from 'electron';
const path = require('path');

const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;

require('events').EventEmitter.defaultMaxListeners = Infinity;

let mainWindow, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === "--serve");

if (serve) {
  require('electron-reload')(__dirname, {});
}

function createWindow() {

  let size = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height
    // width: 880,
    // height: 660
  });

  mainWindow.loadURL('file://' + __dirname + '/index.html');

  if (serve) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    /*
    Dereference the window object, usually you would store window
    in an array if your app supports multi windows, this is the time
    when you should delete the corresponding element.
    */
    mainWindow = null;
  });

  /*mainWindow.on('minimize', function (event) {
    event.preventDefault()
    mainWindow.hide();
  });


  mainWindow.on('close', function (event) {
    // if (!app.isQuiting) {
    event.preventDefault()
    mainWindow.hide();
    // }
    return false;
  });

  let contextMenu = Menu.buildFromTemplate([

    {
      label: 'Show App', click: function () {
      mainWindow.show();
    }
    },
    {
      label: 'Quit', click: function () {
      // app.isQuiting = true;
      app.quit();

    }
    }
  ]);

  let appIcon = new Tray(path.join(__dirname, '../src/assets/tray-icon.png'));
  // appIcon.setToolTip('Electron.js App');
  appIcon.setContextMenu(contextMenu);*/

}

try {

  /*
  This method will be called when Electron has finished
  initialization and is ready to create browser windows.
  Some APIs can only be used after this event occurs.
  */
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow();
    }
  });

  ipc.on('open-signout-dialog', function (event) {
    const options = {
      type: 'info',
      title: 'Sign Out',
      message: "Mounted partition will be disconnected and synchronization will be stopped!\n\n" +
      "Do you want to sign out from Pocket Drive?",
      buttons: ['Yes', 'No']
    };

    dialog.showMessageBox(options, function (index) {
      event.sender.send('signout-dialog-selection', index)
    })
  })

} catch (e) {
}
