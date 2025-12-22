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
  }
};
