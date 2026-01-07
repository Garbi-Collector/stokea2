const db = require('../database');

module.exports = {

  get() {
    return new Promise((res, rej) =>
      db.get(
        'SELECT * FROM user_config WHERE id = 1',
        [],
        (e, r) => e ? rej(e) : res(r)
      )
    );
  },

  createIfNotExists(name = 'Usuario') {
    return new Promise((res, rej) =>
      db.run(
        `
        INSERT OR IGNORE INTO user_config (id, name, is_first_time)
        VALUES (1, ?, 1)
        `,
        [name],
        function (e) {
          e ? rej(e) : res({ created: this.changes });
        }
      )
    );
  },

  updateName(name) {
    return new Promise((res, rej) =>
      db.run(
        'UPDATE user_config SET name=? WHERE id=1',
        [name],
        function (e) {
          e ? rej(e) : res({ changes: this.changes });
        }
      )
    );
  },

  markVisited() {
    return new Promise((res, rej) =>
      db.run(
        'UPDATE user_config SET is_first_time=0 WHERE id=1',
        [],
        function (e) {
          e ? rej(e) : res({ changes: this.changes });
        }
      )
    );
  },

  resetFirstVisit() {
    return new Promise((res, rej) =>
      db.run(
        'UPDATE user_config SET is_first_time=1 WHERE id=1',
        [],
        function (e) {
          e ? rej(e) : res({ changes: this.changes });
        }
      )
    );
  }

};
