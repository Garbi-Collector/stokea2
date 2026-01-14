const { ipcMain } = require('electron');
const repo = require('../repositories/cash-session.repository');

module.exports = () => {

  ipcMain.handle('cash-session:open', (_, startAmount) => {
    return repo.open(startAmount);
  });

  ipcMain.handle('cash-session:getOpen', () => {
    return repo.getOpen();
  });

  ipcMain.handle('cash-session:getAll', () => {
    return repo.getAll();
  });

  ipcMain.handle('cash-session:close', (_, data) => {
    return repo.close(data.id, data.amount);
  });

  ipcMain.handle('cash-session:closeAll', (_, amount) => {
    return repo.closeAll(amount);
  });
};
