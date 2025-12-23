const { ipcMain } = require('electron');
const repo = require('../repositories/cash-movement.repository');

module.exports = () => {

  // Crear movimiento de caja (ingreso / egreso)
  ipcMain.handle('cashMovement:create', (_, movement) => {
    return repo.create(movement);
  });

  // Obtener movimientos por sesión de caja
  ipcMain.handle('cashMovement:getBySession', (_, sessionId) => {
    return repo.getBySession(sessionId);
  });

};
