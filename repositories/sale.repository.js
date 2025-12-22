const db = require('../database');

module.exports = {
  create(sale) {
    return new Promise((res, rej) =>
      db.run(
        `INSERT INTO sales (cash_session_id, total)
         VALUES (?, ?)`,
        [sale.cash_session_id, sale.total],
        function (e) {
          e ? rej(e) : res({ id: this.lastID });
        }
      )
    );
  }
};
