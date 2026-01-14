const { ipcMain } = require('electron');
const repo = require('../repositories/user.repository');

module.exports = () => {

  ipcMain.handle('user:get', () =>
    repo.get()
  );

  ipcMain.handle('user:init', (_, name) =>
    repo.createIfNotExists(name)
  );

  ipcMain.handle('user:updateName', (_, name) =>
    repo.updateName(name)
  );

  ipcMain.handle('user:markVisited', () =>
    repo.markVisited()
  );

  ipcMain.handle('user:resetFirstVisit', () =>
    repo.resetFirstVisit()
  );

  ipcMain.handle(
    'user:updateSchedule',
    (_, openHour, openMinute, closeHour, closeMinute) =>
      repo.updateSchedule(openHour, openMinute, closeHour, closeMinute)
  );

};
