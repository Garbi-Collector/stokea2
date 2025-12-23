const { ipcMain } = require('electron');
const repo = require('../repositories/stock.repository');

module.exports = () => {

  ipcMain.handle('stock:getAll', () => repo.getAll());

  ipcMain.handle('stock:getByProduct', (_, productId) =>
    repo.getByProduct(productId)
  );

  ipcMain.handle('stock:create', (_, stock) =>
    repo.create(stock)
  );

  ipcMain.handle('stock:update', (_, data) =>
    repo.update(data.id, data.stock)
  );

};
