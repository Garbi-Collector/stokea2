const { app, BrowserWindow, Menu } = require('electron');
const url = require('url');
const path = require('path');

// Inicializa DB
require('./database');

// Registra IPCs
require('./ipc/product.ipc')();
require('./ipc/stock.ipc')();
require('./ipc/cash-session.ipc')();
require('./ipc/cash-movement.ipc')();
require('./ipc/sale.ipc')();
require('./ipc/sale-item.ipc')();

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  Menu.setApplicationMenu(null);
  mainWindow.maximize();

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/stokea2/browser/index.html`),
      protocol: 'file:',
      slashes: true
    })
  );

  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
