const { ipcMain } = require('electron');
const repo = require('../repositories/sale-item.repository');

module.exports = () => {
  ipcMain.handle('sale-items:create', (_, item) => {
    return repo.create(item);
  });

  ipcMain.handle('sale-items:getById', (_, id) => {
    return repo.getById(id);
  });

  ipcMain.handle('sale-items:getBySale', (_, saleId) => {
    return repo.getBySale(saleId);
  });

  ipcMain.handle('sale-items:update', (_, { id, item }) => {
    return repo.update(id, item);
  });
};
