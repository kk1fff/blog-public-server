exports.responseError = function(resp, errCode) {
  resp.statusCode = errCode;
  resp.end();
};
