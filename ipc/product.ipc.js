const { ipcMain } = require('electron');
const repo = require('../repositories/product.repository');

module.exports = () => {
  ipcMain.handle('products:getAll', () => repo.getAll());
  ipcMain.handle('products:getById', (_, id) => repo.getById(id));
  ipcMain.handle('products:create', (_, p) => repo.create(p));
  ipcMain.handle('products:createMany', (_, products) => repo.createMany(products));
  ipcMain.handle('products:update', (_, d) => repo.update(d.id, d.product));
  ipcMain.handle('products:delete', (_, id) => repo.delete(id));
  ipcMain.handle('products:count', () => repo.count());
  ipcMain.handle('products:getAllWithStock',() => repo.getAllWithStock());

};
