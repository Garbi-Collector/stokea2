const db = require('../database');
module.exports = {
  create(item) {
    return new Promise((res, rej) =>
      db.run(
        `INSERT INTO sale_items
           (sale_id, product_id, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [
          item.sale_id,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.subtotal
        ],
        function (e) {
          e ? rej(e) : res({ id: this.lastID });
        }
      )
    );
  },
  getById(id) {
    return new Promise((res, rej) =>
      db.get(
        'SELECT * FROM sale_items WHERE id=?',
        [id],
        (e, r) => e ? rej(e) : res(r)
      )
    );
  },
  getBySale(saleId) {
    return new Promise((res, rej) =>
      db.all(
        'SELECT * FROM sale_items WHERE sale_id=?',
        [saleId],
        (e, rows) => e ? rej(e) : res(rows)
      )
    );
  },
  update(id, item) {
    return new Promise((res, rej) =>
      db.run(
        `UPDATE sale_items
         SET sale_id=?, product_id=?, quantity=?, unit_price=?, subtotal=?
         WHERE id=?`,
        [
          item.sale_id,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.subtotal,
          id
        ],
        function (e) {
          e ? rej(e) : res({ changes: this.changes });
        }
      )
    );
  }
};
