var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.

var ipc = require('ipc');
var five = require('johnny-five');
var _ = require('lodash');

// Report crashes to our server.
require('crash-reporter').start();
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1024, height: 768});

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  var initBoardBounded = _.bind(function initBoard() {
    var board = new five.Board({port: '/dev/cu.usbserial-AH01D6FP'});

    board.on("ready", function() {
      var imu = new five.IMU({
        controller: "MPU6050",
        freq: 10
      });

      imu.on("data", function() {
        mainWindow.webContents.send('imu-changed', {
          accX: this.accelerometer.x,
          accY: this.accelerometer.y,
          accZ: this.accelerometer.z,
          gyrX: this.gyro.x,
          gyrY: this.gyro.y,
          gyrZ: this.gyro.z,
          gyrRX: this.gyro.rate.x,
          gyrRY: this.gyro.rate.y,
          gyrRZ: this.gyro.rate.z
        });  
      });
    });
  }, this);

  ipc.on('connect', function() {
    initBoardBounded();
  });

  // Open the DevTools.
  // mainWindow.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});