function log(consoleFunc, prefix, tag, message) {
  console[consoleFunc](prefix + ": " + message);
}

function fake_log() {

}

exports.setLogEnabled = function (v) {
  if (v) {
    exports.l = log.bind(this, 'log', 'Log', '');
  } else {
    exports.l = fake_log;
  }
};

exports.w = log.bind(exports, 'warn', 'Warning', '');
exports.e = log.bind(exports, 'error', 'Error', '');

// Default to false.
exports.setLogEnabled(false);
