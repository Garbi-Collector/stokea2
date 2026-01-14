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
};
