const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  products: {
    getAll: () => ipcRenderer.invoke('products:getAll'),
    create: (p) => ipcRenderer.invoke('products:create', p),
    update: (id, p) => ipcRenderer.invoke('products:update', { id, product: p }),
    delete: (id) => ipcRenderer.invoke('products:delete', id),
  }
});

