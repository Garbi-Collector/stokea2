const { ipcMain } = require('electron');
const repo = require('../repositories/sale-item.repository');

module.exports = () => {

  ipcMain.handle('sale-items:create', (_, item) => {
    return repo.create(item);
  });

};
