const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {

  /* =======================
     PRODUCTS
  ======================= */
  products: {
    getAll: () =>
      ipcRenderer.invoke('products:getAll'),

    getById: (id) =>
      ipcRenderer.invoke('products:getById', id),

    create: (product) =>
      ipcRenderer.invoke('products:create', product),

    update: (id, product) =>
      ipcRenderer.invoke('products:update', { id, product }),

    delete: (id) =>
      ipcRenderer.invoke('products:delete', id),
  },

  /* =======================
     STOCK
  ======================= */
  stock: {
    getAll: () =>
      ipcRenderer.invoke('stock:getAll'),

    getByProduct: (productId) =>
      ipcRenderer.invoke('stock:getByProduct', productId),

    create: (stock) =>
      ipcRenderer.invoke('stock:create', stock),

    update: (id, stock) =>
      ipcRenderer.invoke('stock:update', { id, stock }),
  },

  /* =======================
     CASH SESSION
  ======================= */
  cashSession: {
    open: (startAmount) =>
      ipcRenderer.invoke('cash-session:open', startAmount),

    getOpen: () =>
      ipcRenderer.invoke('cash-session:getOpen'),

    close: (id, amount) =>
      ipcRenderer.invoke('cash-session:close', { id, amount }),
  },

  /* =======================
     CASH MOVEMENTS
  ======================= */
  cashMovements: {
    create: (movement) =>
      ipcRenderer.invoke('cash-movements:create', movement),

    getBySession: (sessionId) =>
      ipcRenderer.invoke('cash-movements:getBySession', sessionId),
  },

  /* =======================
     SALES
  ======================= */
  sales: {
    create: (sale) =>
      ipcRenderer.invoke('sale:create', sale),
  },

  /* =======================
     SALE ITEMS
  ======================= */
  saleItems: {
    create: (item) =>
      ipcRenderer.invoke('sale-items:create', item),
  },

});
