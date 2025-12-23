const { ipcMain } = require('electron');
const repo = require('../repositories/sale.repository');

module.exports = () => {

  // Crear venta
  ipcMain.handle('sale:create', (_, sale) => {
    return repo.create(sale);
  });

};
