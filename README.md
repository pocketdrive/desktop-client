# desktop-client

## Prerequisites
* Node
* NPM
* Electron

### Install Electron

    npm install -g electron-prebuilt
    
Check whether your electron works correctly

    electron --version

## Run the project

Install bower

    npm install -g bower

Run following commands inside the root folder of the project where package.json located at. 

    bower install bootstrap
    npm install --save jquery
    npm install sudo-prompt
    
Run the app

    electron ./main.js
