const db = require('../database');

module.exports = {
  getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM products', [], (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });
  },

  getAllWithStock() {
    return new Promise((resolve, reject) => {
      db.all(
        `
      SELECT
        p.*,
        s.quantity,
        s.min_alert
      FROM products p
      INNER JOIN stock s ON s.product_id = p.id
      WHERE s.quantity > 0
      `,
        [],
        (err, rows) => err ? reject(err) : resolve(rows)
      );
    });
  },


  getById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) =>
        err ? reject(err) : resolve(row)
      );
    });
  },

  create(p) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO products
         (name, description, brand, code, wholesale_price, profit_percentage, sale_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          p.name, p.description, p.brand, p.code,
          p.wholesale_price, p.profit_percentage, p.sale_price
        ],
        function (err) {
          err ? reject(err) : resolve({ id: this.lastID });
        }
      );
    });
  },

  update(id, p) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE products SET
          name=?, description=?, brand=?, code=?,
          wholesale_price=?, profit_percentage=?, sale_price=?
         WHERE id=?`,
        [
          p.name, p.description, p.brand, p.code,
          p.wholesale_price, p.profit_percentage, p.sale_price, id
        ],
        function (err) {
          err ? reject(err) : resolve({ changes: this.changes });
        }
      );
    });
  },

  delete(id) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM products WHERE id=?',
        [id],
        function (err) {
          err ? reject(err) : resolve({ deleted: this.changes });
        }
      );
    });
  },

  count() {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) AS total FROM products',
        [],
        (err, row) => {
          err ? reject(err) : resolve(row.total);
        }
      );
    });
  },

  createMany(products) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const stmt = db.prepare(
          `INSERT INTO products
           (name, description, brand, code, wholesale_price, profit_percentage, sale_price)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        );

        try {
          for (const p of products) {
            stmt.run([
              p.name,
              p.description,
              p.brand,
              p.code,
              p.wholesale_price,
              p.profit_percentage,
              p.sale_price
            ]);
          }

          stmt.finalize();
          db.run('COMMIT');
          resolve({ inserted: products.length });

        } catch (err) {
          db.run('ROLLBACK');
          reject(err);
        }
      });
    });
  }



};
