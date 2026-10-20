(function (root) {
  'use strict';

  var results = [];

  function test(name, fn) {
    try {
      fn();
      results.push({ name: name, pass: true });
    } catch (e) {
      results.push({ name: name, pass: false, error: e.message });
    }
  }

  function assertEqual(actual, expected, msg) {
    if (actual !== expected) {
      throw new Error((msg || 'assertEqual') + ': expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
    }
  }

  function assertTrue(cond, msg) {
    if (!cond) throw new Error(msg || 'assertTrue failed');
  }

  function assertClose(actual, expected, tol, msg) {
    if (Math.abs(actual - expected) > tol) {
      throw new Error((msg || 'assertClose') + ': expected ' + expected + ' (+/-' + tol + '), got ' + actual);
    }
  }

  function report() {
    var failed = results.filter(function (r) { return !r.pass; });
    var lines = results.map(function (r) {
      return (r.pass ? 'PASS ' : 'FAIL ') + r.name + (r.pass ? '' : ' -> ' + r.error);
    });
    lines.push('SUMMARY: ' + (results.length - failed.length) + '/' + results.length + ' passed');
    var text = lines.join('\n');
    root.__testReport = text;
    root.__testFailed = failed.length;
    if (typeof document !== 'undefined') {
      var pre = document.getElementById('out');
      if (pre) pre.textContent = text;
    }
    if (typeof console !== 'undefined') console.log(text);
    return failed.length;
  }

  root.T = { test: test, assertEqual: assertEqual, assertTrue: assertTrue, assertClose: assertClose, report: report };
})(typeof window !== 'undefined' ? window : globalThis);
