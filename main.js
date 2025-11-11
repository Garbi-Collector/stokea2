const { app, BrowserWindow, Menu } = require('electron')
const url = require('url');
const path = require('path');

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    show: false  // No mostrar hasta que esté lista
  })

  // Eliminar el menú/dropdown
  Menu.setApplicationMenu(null)

  // Maximizar la ventana
  mainWindow.maximize()

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/angular-electron-template/browser/index.html`),
      protocol: "file:",
      slashes: true
    })
  );

  // Mostrar la ventana una vez que esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})
