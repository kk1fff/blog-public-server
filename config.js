var fs = require('fs'),
    l = require('./logger.js'),
    localConf = {};

exports.load = function load(filename) {
  var conf = fs.readFileSync(filename);
  if (!conf) {
    l.w("Fail to read configure file: " + filename);
    return;
  }
  try {
    conf = JSON.parse(conf);
    this.loadOptions(conf);
  } catch (e) {
    l.w("Loading configure file error, file: " + filename + ", error: " + e);
  }
};

exports.loadOptions = function loadOptions(conf) {
  if (!conf) return;

  if (typeof conf == 'object') {
    var keys = Object.keys(conf);
    for (var i = 0; i < keys.length; i++) {
      if (conf[keys[i]]) {
        localConf[keys[i]] = conf[keys[i]];
      }
    }
  }
};

exports.get = function get(key) {
  return localConf[key];
};
