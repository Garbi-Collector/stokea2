const { ipcMain } = require('electron');
const repo = require('../repositories/cash-movement.repository');

module.exports = () => {
  ipcMain.handle('cash-movements:create', (_, movement) => {
    return repo.create(movement);
  });

  ipcMain.handle('cash-movements:getBySession', (_, sessionId) => {
    return repo.getBySession(sessionId);
  });

  ipcMain.handle('cash-movements:getById', (_, id) => {
    return repo.getById(id);
  });

  ipcMain.handle('cash-movements:update', (_, { id, movement }) => {
    return repo.update(id, movement);
  });
};
