const { ipcMain } = require('electron');
const repo = require('../repositories/cash-movement.repository');

module.exports = () => {

  // Crear movimiento de caja (ingreso / egreso)
  ipcMain.handle('cash-movements:create', (_, movement) => {
    return repo.create(movement);
  });

  // Obtener movimientos por sesión de caja
  ipcMain.handle('cash-movements:getBySession', (_, sessionId) => {
    return repo.getBySession(sessionId);
  });
};
