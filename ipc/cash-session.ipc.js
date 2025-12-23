const { ipcMain } = require('electron');
const repo = require('../repositories/cash-session.repository');

module.exports = () => {

  // Abrir caja
  ipcMain.handle('cashSession:open', (_, startAmount) => {
    return repo.open(startAmount);
  });

  // Obtener caja abierta
  ipcMain.handle('cashSession:getOpen', () => {
    return repo.getOpen();
  });

  // Cerrar caja
  ipcMain.handle('cashSession:close', (_, data) => {
    return repo.close(data.id, data.amount);
  });

};
