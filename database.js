const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

const dbPath = path.join(app.getPath('userData'), 'stokea2.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error abriendo la DB', err);
  } else {
    console.log('SQLite conectada en', dbPath);
  }
});

db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
                                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                                          name TEXT NOT NULL,
                                          description TEXT,
                                          brand TEXT,
                                          code TEXT UNIQUE NOT NULL,
                                          wholesale_price REAL NOT NULL,
                                          profit_percentage REAL NOT NULL,
                                          sale_price REAL NOT NULL,
                                          created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS stock (
                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                       product_id INTEGER NOT NULL,
                                       quantity INTEGER NOT NULL,
                                       min_alert INTEGER DEFAULT 5,
                                       FOREIGN KEY (product_id) REFERENCES products(id)
      )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cash_session (
                                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                                              start_amount REAL NOT NULL,
                                              current_amount REAL NOT NULL,
                                              opened_at TEXT DEFAULT CURRENT_TIMESTAMP,
                                              closed_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cash_movements (
                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                cash_session_id INTEGER NOT NULL,
                                                type TEXT NOT NULL,
                                                amount REAL NOT NULL,
                                                description TEXT,
                                                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                                                FOREIGN KEY (cash_session_id) REFERENCES cash_session(id)
      )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sales (
                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                       cash_session_id INTEGER NOT NULL,
                                       total REAL NOT NULL,
                                       created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                                       FOREIGN KEY (cash_session_id) REFERENCES cash_session(id)
      )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sale_items (
                                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                                            sale_id INTEGER NOT NULL,
                                            product_id INTEGER NOT NULL,
                                            quantity INTEGER NOT NULL,
                                            unit_price REAL NOT NULL,
                                            subtotal REAL NOT NULL,
                                            FOREIGN KEY (sale_id) REFERENCES sales(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
      )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_config (
                                             id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      is_first_time INTEGER NOT NULL DEFAULT 1,

      open_hour INTEGER NOT NULL CHECK (open_hour BETWEEN 0 AND 23),
      open_minute INTEGER NOT NULL CHECK (open_minute BETWEEN 0 AND 59),

      close_hour INTEGER NOT NULL CHECK (close_hour BETWEEN 0 AND 23),
      close_minute INTEGER NOT NULL CHECK (close_minute BETWEEN 0 AND 59)
      )
  `);

});

module.exports = db;
