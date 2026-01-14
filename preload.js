const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {

  /* =======================
     PRODUCTS
  ======================= */
  products: {
    getAll: () => ipcRenderer.invoke('products:getAll'),
    getById: (id) => ipcRenderer.invoke('products:getById', id),
    create: (product) => ipcRenderer.invoke('products:create', product),
    createMany: (products) => ipcRenderer.invoke('products:createMany', products),
    update: (id, product) =>
      ipcRenderer.invoke('products:update', { id, product }),
    delete: (id) => ipcRenderer.invoke('products:delete', id),
    count: () => ipcRenderer.invoke('products:count')
  },

  /* =======================
     STOCK
  ======================= */
  stock: {
    getAll: () => ipcRenderer.invoke('stock:getAll'),
    getByProduct: (productId) =>
      ipcRenderer.invoke('stock:getByProduct', productId),
    create: (stock) => ipcRenderer.invoke('stock:create', stock),
    update: (id, stock) =>
      ipcRenderer.invoke('stock:update', { id, stock }),
    deleteByProduct: (productId) =>
      ipcRenderer.invoke('stock:deleteByProduct', productId),
  },

  /* =======================
     CASH SESSION
  ======================= */
  cashSession: {
    open: (startAmount) =>
      ipcRenderer.invoke('cash-session:open', startAmount),
    getOpen: () =>
      ipcRenderer.invoke('cash-session:getOpen'),
    getAll: () =>
      ipcRenderer.invoke('cash-session:getAll'),
    close: (id, amount) =>
      ipcRenderer.invoke('cash-session:close', { id, amount }),
    closeAll: (amount) =>
      ipcRenderer.invoke('cash-session:closeAll', amount),
    updateCurrentAmount: (sessionId, delta) =>
      ipcRenderer.invoke(
        'cash-session:updateCurrentAmount',
        { sessionId, delta }
      ),
  },


  /* =======================
     CASH MOVEMENTS
  ======================= */
  cashMovements: {
    create: (movement) =>
      ipcRenderer.invoke('cash-movements:create', movement),
    getBySession: (sessionId) =>
      ipcRenderer.invoke('cash-movements:getBySession', sessionId),
    updateCurrentAmount: (sessionId, delta) =>
      ipcRenderer.invoke('cash-session:updateCurrentAmount', sessionId, delta),
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

    /* =======================
     USER CONFIG
  ======================= */
  user: {
    get: () => ipcRenderer.invoke('user:get'),
    init: (name) => ipcRenderer.invoke('user:init', name),
    updateName: (name) => ipcRenderer.invoke('user:updateName', name),
    markVisited: () => ipcRenderer.invoke('user:markVisited'),
    resetFirstVisit: () => ipcRenderer.invoke('user:resetFirstVisit'),

    updateSchedule: (openHour, openMinute, closeHour, closeMinute) =>
      ipcRenderer.invoke(
        'user:updateSchedule',
        openHour,
        openMinute,
        closeHour,
        closeMinute
      )
  },


  /* =======================
     WINDOW CONTROLS 👈
  ======================= */
  windowControls: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
  }
});
