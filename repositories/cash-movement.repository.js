const db = require('../database');
module.exports = {
  create(m) {
    return new Promise((res, rej) =>
      db.run(
        `INSERT INTO cash_movements
           (cash_session_id, type, amount, description)
         VALUES (?, ?, ?, ?)`,
        [m.cash_session_id, m.type, m.amount, m.description],
        function (e) {
          e ? rej(e) : res({ id: this.lastID });
        }
      )
    );
  },
  getBySession(sessionId) {
    return new Promise((res, rej) =>
      db.all(
        'SELECT * FROM cash_movements WHERE cash_session_id=?',
        [sessionId],
        (e, r) => e ? rej(e) : res(r)
      )
    );
  },
  getById(id) {
    return new Promise((res, rej) =>
      db.get(
        'SELECT * FROM cash_movements WHERE id=?',
        [id],
        (e, r) => e ? rej(e) : res(r)
      )
    );
  },
  update(id, m) {
    return new Promise((res, rej) =>
      db.run(
        `UPDATE cash_movements
         SET cash_session_id=?, type=?, amount=?, description=?
         WHERE id=?`,
        [m.cash_session_id, m.type, m.amount, m.description, id],
        function (e) {
          e ? rej(e) : res({ changes: this.changes });
        }
      )
    );
  }
};
