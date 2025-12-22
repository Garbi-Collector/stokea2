const db = require('../database');

module.exports = {
  getAll() {
    return new Promise((res, rej) =>
      db.all('SELECT * FROM stock', [], (e, r) => e ? rej(e) : res(r))
    );
  },

  getByProduct(productId) {
    return new Promise((res, rej) =>
      db.get(
        'SELECT * FROM stock WHERE product_id=?',
        [productId],
        (e, r) => e ? rej(e) : res(r)
      )
    );
  },

  create(s) {
    return new Promise((res, rej) =>
      db.run(
        'INSERT INTO stock (product_id, quantity, min_alert) VALUES (?, ?, ?)',
        [s.product_id, s.quantity, s.min_alert ?? 5],
        function (e) {
          e ? rej(e) : res({ id: this.lastID });
        }
      )
    );
  },

  update(id, s) {
    return new Promise((res, rej) =>
      db.run(
        'UPDATE stock SET quantity=?, min_alert=? WHERE id=?',
        [s.quantity, s.min_alert, id],
        function (e) {
          e ? rej(e) : res({ changes: this.changes });
        }
      )
    );
  }
};
