const db = require('../database');

module.exports = {
  open(startAmount) {
    return new Promise((res, rej) =>
      db.run(
        `INSERT INTO cash_session (start_amount, current_amount)
         VALUES (?, ?)`,
        [startAmount, startAmount],
        function (e) {
          e ? rej(e) : res({ id: this.lastID });
        }
      )
    );
  },

  getOpen() {
    return new Promise((res, rej) =>
      db.get(
        'SELECT * FROM cash_session WHERE closed_at IS NULL',
        [],
        (e, r) => e ? rej(e) : res(r)
      )
    );
  },

  close(id, amount) {
    return new Promise((res, rej) =>
      db.run(
        `UPDATE cash_session
         SET current_amount=?, closed_at=CURRENT_TIMESTAMP
         WHERE id=?`,
        [amount, id],
        function (e) {
          e ? rej(e) : res({ closed: this.changes });
        }
      )
    );
  },
  // repositories/cash-session.repository.js

  getAll() {
    return new Promise((res, rej) =>
      db.all(
        'SELECT * FROM cash_session ORDER BY opened_at DESC',
        [],
        (e, rows) => e ? rej(e) : res(rows)
      )
    );
  },
  closeAll(amount) {
    return new Promise((res, rej) =>
      db.run(
        `UPDATE cash_session
       SET current_amount = ?, closed_at = CURRENT_TIMESTAMP
       WHERE closed_at IS NULL`,
        [amount],
        function (e) {
          e ? rej(e) : res({ closed: this.changes });
        }
      )
    );
  },

  updateCurrentAmount(sessionId, delta) {
    return new Promise((res, rej) =>
      db.run(
        `UPDATE cash_session
       SET current_amount = current_amount + ?
       WHERE id = ? AND closed_at IS NULL`,
        [delta, sessionId],
        function (e) {
          e ? rej(e) : res({ updated: this.changes });
        }
      )
    );
  }
};
