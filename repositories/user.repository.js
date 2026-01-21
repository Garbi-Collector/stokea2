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

  createIfNotExists(
    name = 'Usuario',
    openHour = 0,
    openMinute = 0,
    closeHour = 23,
    closeMinute = 59
  ) {
    return new Promise((res, rej) =>
      db.run(
        `
          INSERT OR IGNORE INTO user_config
      (id, name, is_first_time, open_hour, open_minute, close_hour, close_minute)
      VALUES (1, ?, 1, ?, ?, ?, ?)
        `,
        [name, openHour, openMinute, closeHour, closeMinute],
        function (e) {
          e ? rej(e) : res({ created: this.changes });
        }
      )
    );
  },
  updateSchedule(openHour, openMinute, closeHour, closeMinute) {
    return new Promise((res, rej) =>
      db.run(
        `
      UPDATE user_config
      SET
        open_hour = ?,
        open_minute = ?,
        close_hour = ?,
        close_minute = ?
      WHERE id = 1
      `,
        [openHour, openMinute, closeHour, closeMinute],
        function (e) {
          e ? rej(e) : res({ changes: this.changes });
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

  updateMoneyGoal(moneyGoal) {
    return new Promise((res, rej) => {

      // validación defensiva (opcional pero recomendada)
      if (typeof moneyGoal !== 'number' || moneyGoal <= 0) {
        return rej(new Error('money_goal debe ser un número mayor a 0'));
      }

      db.run(
        `
      UPDATE user_config
      SET money_goal = ?
      WHERE id = 1
      `,
        [moneyGoal],
        function (e) {
          e ? rej(e) : res({ changes: this.changes });
        }
      );
    });
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
