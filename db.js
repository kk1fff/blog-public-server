var CONF = require('./config.js'),
    sqlite = require('sqlite3'),
    l = require('./logger.js'),
    Q = require('q'),
    db,
    dbConfig = {};

function loadDefault() {
  return {
    "version": CONF.get("DB_VERSION")
  };
}

function createDbConfig () {
  var defer = Q.defer();

  l.l("Create 'config' table");
  db.run('CREATE TABLE config (' + 
         'id INTEGER PRIMARY KEY ASC, ' +
         'key CHAR(32) UNIQUE, ' +
         'val TEXT)', function (err) {
           if (err) {
             l.e("Unable to create config table");
             defer.reject(err);
           } else {
             defer.resolve();
           }
         });

  return defer.promise;
}

function setupTables () {
  var q = [
    "CREATE TABLE article (id INTEGER PRIMARY KEY ASC, date INTEGER, title TEXT, content TEXT)",
    "CREATE TABLE assets (id INTEGER PRIMARY KEY ASC, date INTEGER, originName TEXT, mime CHAR(64), content BLOB)"
  ],
      defer = Q.defer();

  function createTableInternal(i, err) {
    if (err) {
      l.e("Error creating table: " + err);
      defer.reject(err);
      return;
    }

    if (i == q.length) {
      // our job is finished.
      defer.resolve();
      return;
    }

    db.run(q[i], createTableInternal.bind(this, i + 1));
  }
  createTableInternal(0);

  return defer.promise;
}

// DB configure is stored in table 'config'.
function getDbConfig () {
  var defer = Q.defer();
  db.all('SELECT * FROM config', function (err, rows) {
    l.l("Database config loaded");
    var i;
    if (err) {
      // Query error, assuming current table is not exist.
      l.l("got error: " + err + " from sqlite, assuming table not exist");
      createDbConfig()
        .then(function() {
          dbConfig = loadDefault();
          return setupTables();
        }, function (err) {
          defer.reject(err);
        })
        .then(function() {
          defer.resolve();
        });
    } else {
      for (i = 0; i < rows.length; i++) {
        dbConfig[rows[i].key] = JSON.parse(rows[i].val);
      }
      defer.resolve();
    }
  });
  return defer.promise;
}

exports.loadDb = function () {
  var defer = Q.defer();
  db = new sqlite.Database(CONF.get('DB_NAME'), function (err) {
    if (err) {
      l.e("Unable to open database: database name: " +
          CONF.get('DB_NAME') + ", error: " + err);
      defer.reject(err);
      return;
    }
    getDbConfig()
      .then(function() {
        defer.resolve();
      }, function(err) {
        defer.reject(err);
      });
  });
  return defer.promise;
};

exports.closeDb = function () {
  if (!db) {
    return Q.fcall(function() {});
  }

  var defer = Q.defer();
  // Write config back to database.
  var writing = 0;
  function maybeCallCallback() {
    if (writing == 0) {
      defer.resolve();
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

  return defer.promise;
};
