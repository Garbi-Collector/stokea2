const { ipcMain } = require('electron');
const repo = require('../repositories/sale.repository');

module.exports = () => {
  ipcMain.handle('sale:create', (_, sale) => {
    return repo.create(sale);
  });

  ipcMain.handle('sale:getById', (_, id) => {
    return repo.getById(id);
  });

  ipcMain.handle('sale:getAll', () => {
    return repo.getAll();
  });

  ipcMain.handle('sale:update', (_, { id, sale }) => {
    return repo.update(id, sale);
  });
};
