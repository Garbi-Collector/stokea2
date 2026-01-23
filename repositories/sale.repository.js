const db = require('../database');
module.exports = {
  create(sale) {
    return new Promise((res, rej) =>
      db.run(
        `INSERT INTO sales (cash_movement_id, total)
         VALUES (?, ?)`,
        [sale.cash_movement_id, sale.total],
        function (e) {
          e ? rej(e) : res({ id: this.lastID });
        }
      )
    );
  },
  getById(id) {
    return new Promise((res, rej) =>
      db.get(
        'SELECT * FROM sales WHERE id=?',
        [id],
        (e, r) => e ? rej(e) : res(r)
      )
    );
  },
  getAll() {
    return new Promise((res, rej) =>
      db.all(
        'SELECT * FROM sales ORDER BY created_at DESC',
        [],
        (e, rows) => e ? rej(e) : res(rows)
      )
    );
  },
  update(id, sale) {
    return new Promise((res, rej) =>
      db.run(
        `UPDATE sales
         SET cash_movement_id=?, total=?
         WHERE id=?`,
        [sale.cash_movement_id, sale.total, id],
        function (e) {
          e ? rej(e) : res({ changes: this.changes });
        }
      )
    );
  }
};
