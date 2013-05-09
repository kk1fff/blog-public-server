var CONF = require('./config.js'),
    sqlite = require('sqlite3'),
    l = require('./logger.js'),
    db,
    dbConfig = {};

function loadDefault() {
  return {
    "version": CONF.get("DB_VERSION")
  };
}

function createDbConfig (cb) {
  l.l("Create 'config' table");
  db.run('CREATE TABLE config (' + 
         'id INTEGER PRIMARY KEY ASC, ' +
         'key CHAR(32) UNIQUE, ' +
         'val TEXT)', function (err) {
           if (err) {
             l.e("Unable to create config table");
           }
           cb (err);
         });
}

function setupTables (cb) {
  var q = [
    "CREATE TABLE article (id INTEGER PRIMARY KEY ASC, date INTEGER, title TEXT, content TEXT)",
    "CREATE TABLE assets (id INTEGER PRIMARY KEY ASC, date INTEGER, originName TEXT, mime CHAR(64), content BLOB)"
  ];

  function createTableInternal(i, err) {
    if (err) {
      l.e("Error creating table: " + err);
      cb(err);
      return;
    }

    if (i == q.length) {
      // our job is finished.
      cb();
      return;
    }

    db.run(q[i], createTableInternal.bind(this, i + 1));
  }
  createTableInternal(0);
}

// DB configure is stored in table 'config'.
function getDbConfig (cb) {
  db.all('SELECT * FROM config', function (err, rows) {
    l.l("Database config loaded");
    if (err) {
      // Query error, assuming current table is not exist.
      l.l("got error: " + err + " from sqlite, assuming table not exist");
      createDbConfig(function (err) {
        if (!err) {
          dbConfig = loadDefault();
          setupTables(cb);
        } else {
          cb(err);
        }
      });
    } else {
      for (var i = 0; i < rows.length; i++) {
        dbConfig[rows[i].key] = JSON.parse(rows[i].val);
      }
      cb();
    }
  });
}


exports.loadDb = function (cb) {
  db = new sqlite.Database(CONF.get('DB_NAME'), function (err) {
    if (err) {
      l.e("Unable to open database: database name: " +
          CONF.get('DB_NAME') + ", error: " + err);
    }
    getDbConfig(cb);
  });
};

exports.closeDb = function (cb) {
  if (!db) {
    setTimeout(cb.bind(this), 0);
  }

  // Write config back to database.
  var writing = 0;
  function maybeCallCallback() {
    if (writing == 0) {
      cb();
    }
  }

  var keys = Object.keys(dbConfig);
  for (var i = 0; i < keys.length; i++) {
    writing++;
    db.run("INSERT OR REPLACE INTO config (key, val) VALUES (?, ?)",
           [keys[i], JSON.stringify(dbConfig[keys[i]])],
           (function (key, val, err) {
             if (err) {
               l.w("Error: writing settings back to database:" + 
                   " key: " + key +
                   " val: " + val +
                   " err: " + err);
             }
             writing--;
             maybeCallCallback();
           }).bind(null, keys[i], dbConfig[keys[i]]));
  }
};